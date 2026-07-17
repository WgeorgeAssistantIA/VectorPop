"""VectorPop - generateur de cles de licence Pro (mode dev / hors Lemon Squeezy).

Utilisation : python generate_license_key.py

Tant que license.LS_STORE_ID est vide, ces cles sont celles que l'app accepte.
Une fois le produit cree sur Lemon Squeezy et LS_STORE_ID rempli, l'app passe
sur les cles Lemon Squeezy et ce script ne sert plus qu'aux tests locaux.
"""

from vectorpop.license import generate_key

if __name__ == "__main__":
    print("=" * 50)
    print("  VectorPop - Generateur de licences Pro")
    print("=" * 50)
    email = input("Email du client : ").strip()
    if email:
        print(f"\nEmail : {email}")
        print(f"Cle   : {generate_key(email)}")
        print("\nEnvoyez ces informations au client.")
    else:
        print("Email vide, annulation.")
    input("\nAppuyez sur Entree pour fermer...")
