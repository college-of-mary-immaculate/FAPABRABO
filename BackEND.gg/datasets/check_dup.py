import pandas as pd
""" ONLY FOR CHEKING DUPLICATES IN CSV """
CSV_PATH = "all_games.csv"
df = pd.read_csv(CSV_PATH, encoding="utf-8-sig")

duplicates = df['name'].str.lower().value_counts()
duplicates = duplicates[duplicates > 1]

if duplicates.empty:
    print("✅ No duplicate game names found.")
else:
    print("⚠️ Duplicate game names detected:\n")
    for name, count in duplicates.items():
        print(f"→ {name}  ({count} entries)")

    
