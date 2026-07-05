import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import os

def train_and_save():
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, "synthetic_customs_data.csv")
    
    if not os.path.exists(data_path):
        print("Data not found, please run synthetic_data.py first.")
        return
        
    df = pd.read_csv(data_path)
    X = df.drop(columns=["risk_label"])
    y = df["risk_label"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBClassifier(
        objective='multi:softprob',
        num_class=3,
        eval_metric='mlogloss',
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    model_path = os.path.join(base_dir, "xgboost_risk_model.json")
    model.save_model(model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_save()
