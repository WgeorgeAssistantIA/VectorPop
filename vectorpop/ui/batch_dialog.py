"""Traitement par lot 2.0 (cahier des charges V2 §2.6 A).

Remplace l'ancien enchainement « choisir UN dossier -> UN format -> message
final » par un vrai ecran : liste de fichiers (ajout par boutons ou
glisser-deposer, dossiers et sous-dossiers compris), vignette + statut par
image, plusieurs formats en une passe, optimisation par image, fond uni,
suffixe et sous-dossier par format, « Relancer les echecs » et « Ouvrir le
dossier de sortie » a la fin.
"""

from __future__ import annotations

import time
from pathlib import Path

from PySide6.QtCore import QSize, Qt, QUrl
from PySide6.QtGui import QBrush, QColor, QDesktopServices, QIcon, QImageReader, QPixmap
from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QDialog,
    QFileDialog,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QProgressBar,
    QPushButton,
    QSpinBox,
    QVBoxLayout,
)

from .. import analytics
from ..app_utils import ACCEPTED
from ..core.workers import BatchWorker

WHITE = "#FFFFFF"
_STATUS_COLORS = {"ok": "#10B981", "warning": "#D97706", "error": "#E5484D"}


def collect_images(paths, recursive: bool = False) -> list[Path]:
    """Images acceptees parmi des fichiers et/ou dossiers, sans doublon, dans
    l'ordre (fichiers tels quels, contenu des dossiers trie par nom)."""
    out: list[Path] = []
    seen: set[Path] = set()

    def _add(p: Path):
        key = p.resolve()
        if key not in seen and p.suffix.lower() in ACCEPTED and p.is_file():
            seen.add(key)
            out.append(p)

    for raw in paths:
        p = Path(raw)
        if p.is_dir():
            it = p.rglob("*") if recursive else p.iterdir()
            for child in sorted(it, key=lambda c: str(c).lower()):
                _add(child)
        else:
            _add(p)
    return out


def _thumb(path: Path, side: int = 40) -> QIcon:
    """Vignette sans charger l'image entiere en memoire (QImageReader reduit
    au decodage) : une photo de 48 Mpx ne fige pas la liste."""
    reader = QImageReader(str(path))
    reader.setAutoTransform(True)
    size = reader.size()
    if size.isValid():
        reader.setScaledSize(
            size.scaled(side, side, Qt.AspectRatioMode.KeepAspectRatio)
        )
    img = reader.read()
    return QIcon(QPixmap.fromImage(img)) if not img.isNull() else QIcon()


class BatchDialog(QDialog):
    def __init__(self, win: "MainWindow", initial_paths=None, source: str = "button"):
        super().__init__(win)
        self._win = win
        self._t = win._t
        self._source = source
        self._items: list[dict] = []  # {"path", "status", "msg"}
        self.worker: BatchWorker | None = None
        self._t0 = 0.0
        self._out_touched = False  # sortie choisie a la main : ne plus la deviner

        self.setWindowTitle(self._t("title_batch"))
        self.setMinimumSize(620, 560)
        self.setAcceptDrops(True)
        lay = QVBoxLayout(self)

        # --- fichiers ---
        row = QHBoxLayout()
        self.btn_add_files = QPushButton(self._t("batch_add_files"))
        self.btn_add_files.clicked.connect(self._pick_files)
        self.btn_add_folder = QPushButton(self._t("batch_add_folder"))
        self.btn_add_folder.setObjectName("dlgSecondary")
        self.btn_add_folder.clicked.connect(self._pick_folder)
        self.chk_recursive = QCheckBox(self._t("batch_recursive"))
        self.btn_clear = QPushButton(self._t("batch_clear"))
        self.btn_clear.setObjectName("dlgLink")
        self.btn_clear.clicked.connect(self.clear)
        row.addWidget(self.btn_add_files)
        row.addWidget(self.btn_add_folder)
        row.addWidget(self.chk_recursive)
        row.addStretch(1)
        row.addWidget(self.btn_clear)
        lay.addLayout(row)

        self.list = QListWidget()
        self.list.setIconSize(QSize(40, 40))
        self.list.setAcceptDrops(False)  # le dialogue gere le depot
        lay.addWidget(self.list, 1)
        self.lbl_hint = QLabel(self._t("batch_drop_hint"))
        self.lbl_hint.setStyleSheet("color: palette(mid); font-size: 11px;")
        lay.addWidget(self.lbl_hint)

        # --- formats / options ---
        fmt_row = QHBoxLayout()
        fmt_row.addWidget(QLabel(self._t("batch_formats")))
        self.chk_svg = QCheckBox("SVG")
        self.chk_svg.setChecked(True)
        self.chk_png = QCheckBox("PNG")
        self.chk_pdf = QCheckBox("PDF")
        for c in (self.chk_svg, self.chk_png, self.chk_pdf):
            c.toggled.connect(self._update_buttons)
            fmt_row.addWidget(c)
        fmt_row.addSpacing(12)
        fmt_row.addWidget(QLabel(self._t("batch_png_size")))
        self.spin_png = QSpinBox()
        self.spin_png.setRange(16, 8192)
        self.spin_png.setValue(getattr(win, "_last_png_size", 2048) or 2048)
        fmt_row.addWidget(self.spin_png)
        fmt_row.addStretch(1)
        lay.addLayout(fmt_row)

        opt_row = QHBoxLayout()
        self.chk_autotune = QCheckBox(self._t("batch_autotune"))
        self.chk_autotune.setToolTip(self._t("batch_autotune_tooltip"))
        opt_row.addWidget(self.chk_autotune)
        opt_row.addSpacing(12)
        opt_row.addWidget(QLabel(self._t("batch_background")))
        self.cmb_bg = QComboBox()
        self.cmb_bg.addItem(self._t("bg_transparent"), None)
        self.cmb_bg.addItem(self._t("bg_white"), WHITE)
        if win.chk_white_bg.isChecked():
            self.cmb_bg.setCurrentIndex(1)
        opt_row.addWidget(self.cmb_bg)
        opt_row.addStretch(1)
        lay.addLayout(opt_row)

        out_row = QHBoxLayout()
        out_row.addWidget(QLabel(self._t("batch_output")))
        self.ed_out = QLineEdit()
        self.ed_out.textEdited.connect(self._mark_out_touched)
        out_row.addWidget(self.ed_out, 1)
        btn_choose = QPushButton(self._t("batch_choose"))
        btn_choose.setObjectName("dlgSecondary")
        btn_choose.clicked.connect(self._pick_output)
        out_row.addWidget(btn_choose)
        lay.addLayout(out_row)

        name_row = QHBoxLayout()
        name_row.addWidget(QLabel(self._t("batch_suffix")))
        self.ed_suffix = QLineEdit("_vector")
        self.ed_suffix.setMaximumWidth(140)
        name_row.addWidget(self.ed_suffix)
        self.chk_subdir = QCheckBox(self._t("batch_subdir"))
        name_row.addWidget(self.chk_subdir)
        name_row.addStretch(1)
        lay.addLayout(name_row)

        # --- execution ---
        self.progress = QProgressBar()
        self.progress.setVisible(False)
        lay.addWidget(self.progress)
        self.lbl_summary = QLabel("")
        self.lbl_summary.setWordWrap(True)
        lay.addWidget(self.lbl_summary)

        bottom = QHBoxLayout()
        self.btn_retry = QPushButton()
        self.btn_retry.setObjectName("dlgSecondary")
        self.btn_retry.clicked.connect(self.retry_failed)
        self.btn_open = QPushButton(self._t("batch_open_output"))
        self.btn_open.setObjectName("dlgSecondary")
        self.btn_open.clicked.connect(self.open_output)
        bottom.addWidget(self.btn_retry)
        bottom.addWidget(self.btn_open)
        bottom.addStretch(1)
        self.btn_close = QPushButton(self._t("batch_close"))
        self.btn_close.setObjectName("dlgLink")
        self.btn_close.clicked.connect(self.reject)
        self.btn_cancel = QPushButton(self._t("batch_cancel"))
        self.btn_cancel.setObjectName("dlgSecondary")
        self.btn_cancel.clicked.connect(self.cancel)
        self.btn_start = QPushButton()
        self.btn_start.setDefault(True)
        self.btn_start.clicked.connect(self.start)
        bottom.addWidget(self.btn_close)
        bottom.addWidget(self.btn_cancel)
        bottom.addWidget(self.btn_start)
        lay.addLayout(bottom)

        self.btn_retry.setVisible(False)
        self.btn_open.setVisible(False)
        self.btn_cancel.setVisible(False)
        if initial_paths:
            self.add_paths(initial_paths, via=source)
        self._update_buttons()

    # --- liste ---

    def add_paths(self, paths, via: str = "files") -> int:
        known = {it["path"].resolve() for it in self._items}
        added = 0
        for p in collect_images(paths, self.chk_recursive.isChecked()):
            if p.resolve() in known:
                continue
            known.add(p.resolve())
            self._items.append({"path": p, "status": "pending", "msg": ""})
            item = QListWidgetItem(_thumb(p), "")
            self.list.addItem(item)
            self._render_row(len(self._items) - 1)
            added += 1
        if added:
            analytics.capture("batch_files_added", {"count": added, "via": via})
            if not self._out_touched:
                first = Path(paths[0])
                base = first if first.is_dir() else first.parent
                self.ed_out.setText(str(base / "VectorPop"))
        self._update_buttons()
        return added

    def clear(self):
        if self.worker is not None:
            return
        self._items.clear()
        self.list.clear()
        self.lbl_summary.setText("")
        self.btn_retry.setVisible(False)
        self.btn_open.setVisible(False)
        self._update_buttons()

    def _render_row(self, idx: int):
        it = self._items[idx]
        status = it["status"]
        label = {
            "pending": self._t("batch_status_pending"),
            "running": self._t("batch_status_running"),
            "ok": self._t("batch_status_ok"),
            "warning": self._t("batch_status_warning"),
            "error": self._t("batch_status_error", msg=it["msg"] or "?"),
        }[status]
        row = self.list.item(idx)
        row.setText(f"{it['path'].name}  —  {label}")
        row.setToolTip(str(it["path"]))
        color = _STATUS_COLORS.get(status)
        row.setForeground(QBrush(QColor(color)) if color else QBrush())

    def _formats(self) -> tuple[str, ...]:
        return tuple(
            f
            for f, c in (
                ("svg", self.chk_svg),
                ("png", self.chk_png),
                ("pdf", self.chk_pdf),
            )
            if c.isChecked()
        )

    def failed_indices(self) -> list[int]:
        return [i for i, it in enumerate(self._items) if it["status"] == "error"]

    def _update_buttons(self):
        running = self.worker is not None
        pending = [i for i, it in enumerate(self._items) if it["status"] == "pending"]
        self.btn_start.setText(self._t("batch_start", n=len(pending)))
        self.btn_start.setEnabled(
            not running and bool(pending) and bool(self._formats())
        )
        self.btn_start.setToolTip("" if self._formats() else self._t("batch_no_format"))
        for w in (self.btn_add_files, self.btn_add_folder, self.btn_clear):
            w.setEnabled(not running)
        self.btn_cancel.setVisible(running)
        self.btn_close.setVisible(not running)
        failed = self.failed_indices()
        self.btn_retry.setText(self._t("batch_retry", n=len(failed)))
        self.btn_retry.setVisible(not running and bool(failed))

    # --- choix fichiers / sortie ---

    def _pick_files(self):
        files, _ = QFileDialog.getOpenFileNames(
            self, self._t("batch_add_files"), self._win._last_dir, self._t("img_filter")
        )
        if files:
            self.add_paths(files, via="files")

    def _pick_folder(self):
        d = QFileDialog.getExistingDirectory(
            self, self._t("batch_dialog_title"), self._win._last_dir
        )
        if d:
            self.add_paths([d], via="folder")

    def _pick_output(self):
        d = QFileDialog.getExistingDirectory(
            self, self._t("batch_out_dialog_title"), self.ed_out.text()
        )
        if d:
            self.set_output(d)

    def _mark_out_touched(self, *_):
        self._out_touched = True

    def set_output(self, path):
        self._out_touched = True
        self.ed_out.setText(str(path))

    # --- glisser-deposer sur le dialogue ---

    def dragEnterEvent(self, e):
        if e.mimeData().hasUrls() and self.worker is None:
            e.acceptProposedAction()

    def dropEvent(self, e):
        paths = [Path(u.toLocalFile()) for u in e.mimeData().urls() if u.isLocalFile()]
        if paths:
            self.add_paths(paths, via="drop")

    # --- execution ---

    def start(self):
        self._run([i for i, it in enumerate(self._items) if it["status"] == "pending"])

    def retry_failed(self):
        failed = self.failed_indices()
        if not failed:
            return
        analytics.capture("batch_retry_failed", {"count": len(failed)})
        for i in failed:
            self._items[i].update(status="pending", msg="")
            self._render_row(i)
        self._run(failed)

    def _run(self, indices: list[int]):
        formats = self._formats()
        if self.worker is not None or not indices or not formats:
            return
        out_dir = Path(self.ed_out.text().strip() or Path.home() / "VectorPop")
        win = self._win
        self.worker = BatchWorker(
            [(i, self._items[i]["path"]) for i in indices],
            out_dir,
            formats,
            win.current_params(),
            win.chk_grad.isChecked(),
            win.chk_refine.isChecked(),
            png_size=self.spin_png.value(),
            autotune=self.chk_autotune.isChecked(),
            background=self.cmb_bg.currentData(),
            suffix=self.ed_suffix.text().strip(),
            subdir_per_format=self.chk_subdir.isChecked(),
        )
        self.worker.item_started.connect(self._on_item_started)
        self.worker.item_done.connect(self._on_item_done)
        self.worker.finished_all.connect(self._on_finished)
        win._batch = self.worker  # closeEvent de la fenetre principale l'attend
        win._last_dir = str(out_dir)
        self.progress.setRange(0, len(indices))
        self.progress.setValue(0)
        self.progress.setVisible(True)
        self.lbl_summary.setText("")
        self.btn_open.setVisible(False)
        self._t0 = time.monotonic()
        analytics.capture(
            "batch_started",
            {
                "count": len(indices),
                "formats": list(formats),
                "format": ",".join(formats),
                "autotune": self.chk_autotune.isChecked(),
                "background": "white" if self.cmb_bg.currentData() else "transparent",
                "png_size": self.spin_png.value() if "png" in formats else None,
                "recursive": self.chk_recursive.isChecked(),
                "subdir_per_format": self.chk_subdir.isChecked(),
                "source": self._source,
            },
        )
        self._update_buttons()
        self.worker.start()

    def _on_item_started(self, idx: int):
        self._items[idx]["status"] = "running"
        self._render_row(idx)
        self.list.scrollToItem(self.list.item(idx))

    def _on_item_done(self, idx: int, status: str, msg: str):
        self._items[idx].update(status=status, msg=msg)
        self._render_row(idx)
        self.progress.setValue(self.progress.value() + 1)

    def _on_finished(self, ok: int, errors: int, warns: int, cancelled: bool):
        for i, it in enumerate(
            self._items
        ):  # annule : ce qui tournait redevient en attente
            if it["status"] == "running":
                it["status"] = "pending"
                self._render_row(i)
        if self.worker is not None:
            self.worker.deleteLater()
        self.worker = None
        self._win._batch = None
        analytics.capture(
            "batch_completed",
            {
                "done": ok,
                "errors": errors,
                "warnings": warns,
                "cancelled": cancelled,
                "duration_ms": round((time.monotonic() - self._t0) * 1000),
            },
        )
        key = "batch_summary_cancelled" if cancelled else "batch_summary"
        self.lbl_summary.setText(self._t(key, ok=ok, warn=warns, err=errors))
        self.btn_open.setVisible(ok > 0)
        self._update_buttons()

    def cancel(self):
        if self.worker is not None:
            self.worker.cancel()

    def open_output(self):
        analytics.capture("batch_open_output_clicked")
        QDesktopServices.openUrl(QUrl.fromLocalFile(self.ed_out.text().strip()))

    def reject(self):
        # Fermer pendant un lot : on l'arrete proprement (pas de thread orphelin).
        if self.worker is not None:
            self.worker.cancel()
            self.worker.wait(5000)
            self._win._batch = None
        super().reject()
