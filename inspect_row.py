import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

df = pd.read_csv('updated_data.csv')
row = df.loc[2104]
for col in df.columns:
    print(f"[{col}]: {row[col]}")
