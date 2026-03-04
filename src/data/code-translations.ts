export interface CodeTranslation {
  python: string;
  javascript: string;
  pseudocode: string;
}

export const LEVEL_CODE_TRANSLATIONS: Record<number, CodeTranslation> = {
  1: {
    python: `# AutomationMind - Level 1
# Basic trigger → action flow

def on_form_submitted(form_data):
    """Trigger: Runs when form is submitted"""
    # Action: Save data to spreadsheet
    save_to_spreadsheet(form_data)

def save_to_spreadsheet(data):
    """Saves form submission to Google Sheets"""
    sheet.append_row([
        data['name'],
        data['email'],
        data['message']
    ])
`,
    javascript: `// AutomationMind - Level 1
// Basic trigger → action flow

// Trigger: Form submission listener
form.addEventListener('submit', (formData) => {
    // Action: Save data to spreadsheet
    saveToSpreadsheet(formData);
});

function saveToSpreadsheet(data) {
    // API call to append row
    sheets.append({
        name: data.name,
        email: data.email,
        message: data.message
    });
}
`,
    pseudocode: `WHEN form is submitted
  THEN save form_data to spreadsheet
END
`,
  },

  2: {
    python: `# AutomationMind - Level 2
# Conditional branching logic

def on_order_received(order):
    """Trigger: Runs when new order arrives"""
    # Condition: Check order amount
    if order['amount'] > 500:
        # YES path: Large orders
        send_to_manager(order)
    else:
        # NO path: Small orders
        auto_approve(order)

def send_to_manager(order):
    """Route order for manager approval"""
    notify_manager(f"Order {order['id']} needs approval")

def auto_approve(order):
    """Automatically approve small orders"""
    process_order(order)
`,
    javascript: `// AutomationMind - Level 2
// Conditional branching logic

// Trigger: Order received listener
onOrderReceived((order) => {
    // Condition: Check order amount
    if (order.amount > 500) {
        // YES path: Large orders
        sendToManager(order);
    } else {
        // NO path: Small orders
        autoApprove(order);
    }
});

function sendToManager(order) {
    // Route for approval
    notifyManager(\`Order \${order.id} needs approval\`);
}

function autoApprove(order) {
    // Process automatically
    processOrder(order);
}
`,
    pseudocode: `WHEN order is received
  IF order.amount > 500 THEN
    send order to manager
  ELSE
    auto-approve order
  END IF
END
`,
  },

  3: {
    python: `# AutomationMind - Level 3
# Data extraction pipeline

import re

def on_email_arrives(email):
    """Trigger: Runs when email received"""
    # Extract: Order number
    order_num = extract_order_number(email.body)

    # Extract: Customer name
    customer = extract_customer_name(email.body)

    # Extract: Amount
    amount = extract_amount(email.body)

    # Action: Save clean data
    save_to_database({
        'order_number': order_num,
        'customer_name': customer,
        'amount': amount
    })

def extract_order_number(text):
    """Extract order number pattern ORD-####"""
    match = re.search(r'ORD-\\d{4}', text)
    return match.group(0) if match else None

def extract_customer_name(text):
    """Extract customer name from text"""
    match = re.search(r"I'm ([A-Z][a-z]+ [A-Z][a-z]+)", text)
    return match.group(1) if match else None

def extract_amount(text):
    """Extract dollar amount"""
    match = re.search(r'\\$(\\d+)', text)
    return int(match.group(1)) if match else None

def save_to_database(data):
    """Insert clean data into database"""
    db.insert('orders', data)
`,
    javascript: `// AutomationMind - Level 3
// Data extraction pipeline

// Trigger: Email received
onEmailArrives((email) => {
    // Extract: Order number
    const orderNum = extractOrderNumber(email.body);

    // Extract: Customer name
    const customer = extractCustomerName(email.body);

    // Extract: Amount
    const amount = extractAmount(email.body);

    // Action: Save clean data
    saveToDatabase({
        orderNumber: orderNum,
        customerName: customer,
        amount: amount
    });
});

function extractOrderNumber(text) {
    // Extract order pattern ORD-####
    const match = text.match(/ORD-\\d{4}/);
    return match ? match[0] : null;
}

function extractCustomerName(text) {
    // Extract name from "I'm [Name]"
    const match = text.match(/I'm ([A-Z][a-z]+ [A-Z][a-z]+)/);
    return match ? match[1] : null;
}

function extractAmount(text) {
    // Extract dollar amount
    const match = text.match(/\\$(\\d+)/);
    return match ? parseInt(match[1]) : null;
}

function saveToDatabase(data) {
    // Insert into database
    db.insert('orders', data);
}
`,
    pseudocode: `WHEN email arrives
  EXTRACT order_number FROM email.body
  EXTRACT customer_name FROM email.body
  EXTRACT amount FROM email.body

  SAVE order_number, customer_name, amount TO database
END
`,
  },
};
