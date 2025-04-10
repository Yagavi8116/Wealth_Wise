from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import google.generativeai as genai 
import re
import os

app = Flask(__name__)
CORS(app)
genai.configure(api_key="AIzaSyAFzVK4fpeQgILVWHeWt2a08fpRfvFF0fI") 
 
model = genai.GenerativeModel("models/gemini-2.0-flash-thinking-exp-01-21")  

def calculate_financial_score(year, month, income, spending, savings, debt, investments):
    prompt = (
        "You are a financial expert. Based on the user's financial details below, "
        "assign a financial health score between 1 and 100 and provide a brief explanation.\n\n"
        f"Time Period: {month}, {year}\n"
        f"Monthly Income: {income}\n"
        f"Spending habits: {spending}\n"
        f"Savings: {savings}\n"
        f"Debt: {debt}\n"
        f"Investments: {investments}\n\n"
        "Format:\n"
        "Score: [number between 1-100]\n"
        "Explanation: [brief summary]"
    )

    response = model.generate_content(prompt)
    response_text = response.text.strip() if response.text else "Unable to generate a score."
    match = re.search(r"Score:\s*(\d+)", response_text)

    score = int(match.group(1)) if match else random.randint(1, 100)
    return {"score": score, "explanation": response_text}

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
def signup():
    return render_template('signup.html') 

@app.route('/signup.html')
def signupMain():
    return render_template('signup.html')

@app.route('/login.html')
def log():
    return render_template('login.html')

@app.route('/home.html')
def homeMain():
    return render_template('home.html')

@app.route('/account.html')
def account():
    return render_template('account.html')

@app.route('/smartSubscription.html')
def smartSub():
    return render_template('smartSubscription.html')

@app.route('/family.html')
def family():
    return render_template('family.html')

@app.route('/visualize.html')
def vis():
    return render_template('visualize.html')

@app.route('/team.html')
def team():
    return render_template('team.html')

@app.route('/goal.html')
def goal():
    return render_template('goal.html') 


@app.route('/financialHealthScore.html')
def financial_health():
    return render_template('financialHealthScore.html')

@app.route('/subscriptionAnalysis.html')
def sub():
    return render_template('subscriptionAnalysis.html')

@app.route('/calculateScore', methods=['POST'])
def calculate_score():
    year = request.form.get('year')
    month = request.form.get('month')
    income = request.form.get('income')
    spending = request.form.get('spending')
    savings = request.form.get('savings')
    debt = request.form.get('debt')
    investments = request.form.get('investments')

    if not all([year, month, income, spending, savings, debt, investments]):
        return jsonify({"error": "Please fill in all the fields."})

    result = calculate_financial_score(year, month, income, spending, savings, debt, investments)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=False)