//! FFI bridge exposing vtracer to Dart via `dart:ffi`.
//!
//! Single entry point: `vectorpop_vectorize` takes a raw RGBA buffer and the
//! same tuning knobs as the desktop app's `VectorParams` (see
//! `vectorpop/vectorizer.py`), and returns the SVG as a C string. Ownership of
//! that string transfers to the caller, who must free it with
//! `vectorpop_free_string`.

use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::slice;

use vtracer::{ColorImage, Config, ColorMode, FitMode};

#[repr(C)]
pub struct VectorizeParams {
    pub color_mode_binary: bool, // false = "color", true = "binary"
    pub filter_speckle: i32,
    pub color_precision: i32,
    pub layer_difference: i32,
    pub corner_threshold: i32,
    pub length_threshold: f64,
    pub splice_threshold: i32,
    pub path_precision: i32, // -1 = None
    pub mode_polygon: i32,   // 0 = spline, 1 = polygon, 2 = pixel/none
    pub max_colors: i32,     // 0 = off, else auto-quantize target color count
}

/// Converts an RGBA8 buffer (`width * height * 4` bytes, row-major, no
/// padding) into an SVG document.
///
/// Returns a newly allocated, NUL-terminated C string on success, or a null
/// pointer if the pipeline failed. The caller owns the returned pointer and
/// must release it via `vectorpop_free_string`.
///
/// # Safety
/// `pixels` must point to at least `width * height * 4` readable bytes and
/// stay valid for the duration of this call.
#[no_mangle]
pub unsafe extern "C" fn vectorpop_vectorize(
    pixels: *const u8,
    width: usize,
    height: usize,
    params: *const VectorizeParams,
) -> *mut c_char {
    if pixels.is_null() || params.is_null() || width == 0 || height == 0 {
        return std::ptr::null_mut();
    }

    let byte_len = width * height * 4;
    let buf = slice::from_raw_parts(pixels, byte_len).to_vec();
    let img = ColorImage {
        pixels: buf,
        width,
        height,
    };

    let p = &*params;
    let config = Config {
        color_mode: if p.color_mode_binary {
            ColorMode::Binary
        } else {
            ColorMode::Color
        },
        filter_speckle: p.filter_speckle.max(0) as usize,
        color_precision: p.color_precision,
        layer_difference: p.layer_difference,
        mode: match p.mode_polygon {
            1 => FitMode::Polygon,
            2 => FitMode::Pixel,
            _ => FitMode::Spline,
        },
        corner_threshold: p.corner_threshold,
        length_threshold: p.length_threshold,
        splice_threshold: p.splice_threshold,
        path_precision: if p.path_precision < 0 {
            None
        } else {
            Some(p.path_precision as u32)
        },
        max_colors: if p.max_colors <= 0 {
            None
        } else {
            Some(p.max_colors as usize)
        },
        ..Config::default()
    };

    let pipeline = match config.build() {
        Ok(pipeline) => pipeline,
        Err(_) => return std::ptr::null_mut(),
    };

    match pipeline.to_svg(&img) {
        Ok(svg) => match CString::new(svg) {
            Ok(cstr) => cstr.into_raw(),
            Err(_) => std::ptr::null_mut(),
        },
        Err(_) => std::ptr::null_mut(),
    }
}

/// Releases a string previously returned by `vectorpop_vectorize`.
///
/// # Safety
/// `ptr` must be a pointer previously returned by `vectorpop_vectorize`, or
/// null (a no-op). Must not be called twice on the same pointer.
#[no_mangle]
pub unsafe extern "C" fn vectorpop_free_string(ptr: *mut c_char) {
    if ptr.is_null() {
        return;
    }
    drop(CString::from_raw(ptr));
}

/// Returns the vtracer/vectorpop_core version, for diagnostics.
#[no_mangle]
pub extern "C" fn vectorpop_version() -> *mut c_char {
    CString::new(env!("CARGO_PKG_VERSION")).unwrap().into_raw()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip_smoke_test() {
        let width = 4usize;
        let height = 4usize;
        let mut pixels = vec![0u8; width * height * 4];
        for chunk in pixels.chunks_exact_mut(4) {
            chunk[0] = 255;
            chunk[3] = 255;
        }
        let params = VectorizeParams {
            color_mode_binary: false,
            filter_speckle: 4,
            color_precision: 6,
            layer_difference: 16,
            corner_threshold: 60,
            length_threshold: 4.0,
            splice_threshold: 45,
            path_precision: 2,
            mode_polygon: 0,
            max_colors: 0,
        };
        unsafe {
            let ptr = vectorpop_vectorize(pixels.as_ptr(), width, height, &params as *const _);
            assert!(!ptr.is_null());
            let svg = CStr::from_ptr(ptr).to_string_lossy().into_owned();
            assert!(svg.contains("<svg"));
            vectorpop_free_string(ptr);
        }
    }
}
