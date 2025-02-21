from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import google.generativeai as genai 
import re
import os

app = Flask(__name__)
CORS(app)
genai.configure(api_key="AIzaSyAFzVK4fpeQgILVWHeWt2a08fpRfvFF0fI") 

model = genai.GenerativeModel(model_name='gemini-pro')  

def calculate_financial_score(spending, savings, debt, investments):
    prompt = (
        f"Evaluate a user's financial health score based on the following details:\n\n"
        f"Spending habits: {spending}\n"
        f"Savings: {savings}\n"
        f"Debt: {debt}\n"
        f"Investments: {investments}\n\n"
        f"Provide a financial health score (0-100) along with a brief explanation."
    )
    
    response = model.generate_content(prompt)
    score = response.text.strip() if response.text else "Unable to generate a score."

    return score

# AI-Powered Subscription Analysis
def analyze_subscriptions(subscriptions):
    prompt = (
        f"Analyze the following list of subscriptions for cost efficiency and suggest optimizations:\n\n"
        f"{subscriptions}\n\n"
        f"Detect duplicate services, suggest cheaper alternatives or bundle options, and provide personalized cost-saving tips."
    )
    
    response = model.generate_content(prompt)
    analysis = response.text.strip() if response.text else "Unable to analyze subscriptions."
    return analysis

@app.route('/')
def home():
    return render_template('home.html') 

@app.route('/home.html')
def homeA():
    return render_template('home.html')

@app.route('/goal.html')
def goal():
    return render_template('goal.html') 

@app.route('/sample.html')
def sample():
    return render_template('sample.html')

@app.route('/financialHealthScore.html')
def financial_health():
    return render_template('financialHealthScore.html')

@app.route('/subscriptionAnalysis.html')
def sub():
    return render_template('subscriptionAnalysis.html')

@app.route('/calculateScore', methods=['POST'])
def calculate_score():
    spending = request.form.get('spending')
    savings = request.form.get('savings')
    debt = request.form.get('debt')
    investments = request.form.get('investments')

    # Validate user input
    if not spending or not savings or not debt or not investments:
        return jsonify({"error": "Please fill in all the fields."})

    # Generate financial health score using AI
    score = calculate_financial_score(spending, savings, debt, investments)

    return jsonify({"score": score})

@app.route('/analyzeSubscriptions', methods=['POST'])
def analyze_subscriptions():
    data = request.json
    subscriptions = data.get('subscriptions', [])

    if not subscriptions:
        return jsonify({"error": "No subscriptions provided."})

    prompt = (
        f"Analyze the user's subscriptions and suggest ways to save money.\n\n"
        f"Subscriptions: {', '.join(subscriptions)}\n\n"
        f"Provide cost-saving suggestions and identify unnecessary expenses."
    )

    response = model.generate_content(prompt)
    analysis = response.text.strip() if response.text else "Unable to generate insights."

    return jsonify({"analysis": analysis})


if __name__ == '__main__':
    app.run(debug=False)

