# TODO: Implement dataset refresh logic
import subprocess
import sys

STEPS = [
    "fetch_maharashtra.py",
    "download_scheme_details.py",
    "clean_data.py",
    "chunk_data.py",
    "generate_embeddings.py"
]


def run(script):
    print("\n" + "=" * 70)
    print(f"Running {script}")
    print("=" * 70)

    result = subprocess.run(
        [sys.executable, script]
    )

    if result.returncode != 0:
        raise SystemExit(
            f"\n❌ Failed while running {script}"
        )


def main():

    for script in STEPS:
        run(script)

    print("\n" + "=" * 70)
    print("✓ Dataset Refresh Completed Successfully")
    print("=" * 70)


if __name__ == "__main__":
    main()