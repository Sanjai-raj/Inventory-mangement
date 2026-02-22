import sys
import json
import argparse
import mysql.connector
from datetime import datetime
import pandas as pd
import numpy as np

# Database Configuration
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': '',
    'database': 'inventory_db'
}

def get_db_connection():
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except mysql.connector.Error as err:
        print(json.dumps({"error": str(err)}))
        sys.exit(1)

def fetch_data(query):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query)
    result = cursor.fetchall()
    conn.close()
    return result

def run_forecast():
    # Fetch historical stock usage or sales data
    # For MVP, let's use inventory_logs where action='delete' (assuming sales/consumption)
    query = """
    SELECT DATE(timestamp) as date, ABS(SUM(quantity_change)) as demand
    FROM inventory_logs 
    WHERE action = 'delete' OR action = 'remove'
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
    """
    data = fetch_data(query)
    
    if not data:
        return {"error": "Insufficient data for forecasting"}

    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)
    
    # Simple Moving Average Forecast (MVP)
    # real world would use ARIMA/Prophet
    df['forecast'] = df['demand'].rolling(window=3, min_periods=1).mean()
    
    # Predict next 7 days (mock logic based on last known average)
    last_avg = df['forecast'].iloc[-1] if not df.empty else 0
    future_dates = pd.date_range(start=df.index[-1] + pd.Timedelta(days=1), periods=7)
    
    forecast_result = []
    for date in future_dates:
        forecast_result.append({
            "date": date.strftime('%Y-%m-%d'),
            "predicted_demand": round(last_avg, 2)
        })

    return forecast_result

def run_anomalies():
    # Fetch expenses
    query = "SELECT * FROM expenses ORDER BY expense_date DESC"
    data = fetch_data(query)
    
    if not data:
        return []

    df = pd.DataFrame(data)
    df['amount'] = pd.to_numeric(df['amount'])
    
    # Z-Score Anomaly Detection
    mean = df['amount'].mean()
    std = df['amount'].std()
    
    anomalies = []
    if std > 0:
        df['z_score'] = (df['amount'] - mean) / std
        # Threshold > 2 for anomaly
        anomaly_df = df[abs(df['z_score']) > 2]
        
        for index, row in anomaly_df.iterrows():
            anomalies.append({
                "id": int(row['id']),
                "title": row['title'],
                "amount": float(row['amount']),
                "date": str(row['expense_date']),
                "score": float(row['z_score']),
                "reason": "High deviation from average expense"
            })
            
    return anomalies

def main():
    parser = argparse.ArgumentParser(description='Inventory Analytics Engine')
    parser.add_argument('mode', choices=['forecast', 'anomalies'], help='Analysis mode')
    
    # Use parse_known_args to avoid issues if PHP passes extra args or flags
    args, unknown = parser.parse_known_args()
    
    result = {}
    try:
        if args.mode == 'forecast':
            result = run_forecast()
        elif args.mode == 'anomalies':
            result = run_anomalies()
    except Exception as e:
        result = {"error": str(e)}
        
    print(json.dumps(result))

if __name__ == "__main__":
    main()
