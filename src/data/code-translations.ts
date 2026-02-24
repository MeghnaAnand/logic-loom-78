export interface CodeTranslation {
  python: string;
  javascript: string;
  n8n: string;
  pseudocode: string;
}

export const LEVEL_CODE_TRANSLATIONS: Record<number, CodeTranslation> = {
  1: {
    python: `# Level 1: Basic Automation
# Trigger: Form submission → Action: Save to Spreadsheet

# TRIGGER: This function runs automatically when a form is submitted
# 💡 In automation, a "trigger" is the event that starts everything
def on_form_submitted(form_data):
    """Triggered when a new form is submitted."""
    name = form_data["name"]
    email = form_data["email"]

    # ACTION: This executes your desired task
    # 💡 An "action" is what happens in response to the trigger
    save_to_spreadsheet({
        "name": name,
        "email": email,
        "timestamp": datetime.now()
    })

    print(f"✅ Saved {name} ({email}) to spreadsheet")

# 💡 In automation, you define WHEN (trigger) and WHAT (action)
# That's the foundation of every workflow!
`,
    javascript: `// Level 1: Basic Automation
// Trigger: Form submission → Action: Save to Spreadsheet

// TRIGGER: This listener fires automatically when the form is submitted
// 💡 In automation, a "trigger" is the event that starts everything
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const name = formData.get('name');
  const email = formData.get('email');

  // ACTION: This executes your desired task
  // 💡 An "action" is what happens in response to the trigger
  await saveToSpreadsheet({
    name,
    email,
    timestamp: new Date().toISOString()
  });

  console.log(\`✅ Saved \${name} (\${email}) to spreadsheet\`);
});

// 💡 In automation, you define WHEN (trigger) and WHAT (action)
// That's the foundation of every workflow!
`,
    n8n: `{
  "name": "Form to Spreadsheet",
  "nodes": [
    {
      "name": "Form Trigger",
      "type": "n8n-nodes-base.formTrigger",
      "position": [250, 300],
      "parameters": {
        "formTitle": "Contact Form",
        "formFields": {
          "values": [
            { "fieldLabel": "Name", "fieldType": "string" },
            { "fieldLabel": "Email", "fieldType": "email" }
          ]
        }
      }
    },
    {
      "name": "Save to Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "position": [500, 300],
      "parameters": {
        "operation": "appendOrUpdate",
        "sheetName": "Submissions"
      }
    }
  ],
  "connections": {
    "Form Trigger": {
      "main": [[ { "node": "Save to Google Sheets", "type": "main" } ]]
    }
  }
}
`,
    pseudocode: `AUTOMATION: Form to Spreadsheet

# 💡 TRIGGER = the event that kicks off your automation
WHEN form_is_submitted:
    RECEIVE name, email FROM form

    # 💡 ACTION = what you want to happen automatically
    DO save_to_spreadsheet(name, email, current_time)

    LOG "Saved {name} ({email}) to spreadsheet"
END

# 💡 Every automation has at least one TRIGGER and one ACTION
`,
  },

  2: {
    python: `# Level 2: Conditional Logic

# TRIGGER: This function runs when an order is received
# 💡 The trigger starts the workflow, just like Level 1
def on_order_received(order):
    # CONDITION: This is how you make decisions in code
    # 💡 Conditions let your automation take different paths
    if order['amount'] > 500:
        # YES path — when the condition is true
        send_to_manager(order)
    else:
        # NO path — when the condition is false
        auto_approve(order)

# 💡 Conditions add intelligence: your automation can now DECIDE
# instead of always doing the same thing
`,
    javascript: `// Level 2: Conditional Logic

// TRIGGER: This callback fires when an order is received
// 💡 The trigger starts the workflow, just like Level 1
onOrderReceived((order) => {
    // CONDITION: This is how you make decisions in code
    // 💡 Conditions let your automation take different paths
    if (order.amount > 500) {
        // YES path — when the condition is true
        sendToManager(order);
    } else {
        // NO path — when the condition is false
        autoApprove(order);
    }
});

// 💡 Conditions add intelligence: your automation can now DECIDE
// instead of always doing the same thing
`,
    n8n: `{
  "nodes": [
    { "type": "trigger", "comment": "TRIGGER: Starts when order arrives" },
    { "type": "if", "parameters": { "condition": "amount > 500" }, "comment": "CONDITION: Routes based on amount" },
    { "type": "sendToManager", "comment": "ACTION (YES path)" },
    { "type": "autoApprove", "comment": "ACTION (NO path)" }
  ]
}
`,
    pseudocode: `AUTOMATION: Smart Order Router

# 💡 TRIGGER = the event that kicks off your automation
WHEN order_is_received:
    RECEIVE amount FROM order

    # 💡 CONDITION = a decision point that creates two paths
    IF amount > 500 THEN
        # YES path
        DO send_to_manager(order)
    ELSE
        # NO path
        DO auto_approve(order)
    END IF
END

# 💡 With conditions, one trigger can lead to MULTIPLE outcomes
`,
  },

  3: {
    python: `# Level 3: Data Detective
# Trigger: Email → Extract Order → Extract Customer → Extract Amount → Save

import re

# TRIGGER: This function runs when an email arrives
# 💡 Triggers can listen for many events — here it's incoming email
def on_email_received(email):
    """Triggered when an order confirmation email arrives."""
    raw_text = email["body"]

    # DATA EXTRACTION: Pull structured info from messy text
    # 💡 Data blocks transform raw input into clean, usable values

    # Step 1: Extract Order Number
    order_match = re.search(r"ORD-\\d+", raw_text)
    order_number = order_match.group() if order_match else "UNKNOWN"

    # Step 2: Extract Customer Name
    customer_match = re.search(
        r"(?:placed by|Customer)\\s+([A-Z][a-z]+ [A-Z][a-záéíóú]+)",
        raw_text
    )
    customer_name = customer_match.group(1) if customer_match else "UNKNOWN"

    # Step 3: Extract Amount
    amount_match = re.search(r"\\$[\\d,]+", raw_text)
    amount = amount_match.group() if amount_match else "$0"

    # ACTION: Save the clean, structured data
    save_to_database({
        "order": order_number,
        "customer": customer_name,
        "amount": amount
    })

    print(f"✅ Extracted: {order_number}, {customer_name}, {amount}")

# 💡 Data extraction turns chaos into order — a key automation skill!
`,
    javascript: `// Level 3: Data Detective
// Trigger: Email → Extract Order → Extract Customer → Extract Amount → Save

// TRIGGER: This listener fires when a new email arrives
// 💡 Triggers can listen for many events — here it's incoming email
emailService.on('newEmail', async (email) => {
  const rawText = email.body;

  // DATA EXTRACTION: Pull structured info from messy text
  // 💡 Data blocks transform raw input into clean, usable values

  // Step 1: Extract Order Number
  const orderMatch = rawText.match(/ORD-\\d+/);
  const orderNumber = orderMatch?.[0] ?? 'UNKNOWN';

  // Step 2: Extract Customer Name
  const customerMatch = rawText.match(
    /(?:placed by|Customer)\\s+([A-Z][a-z]+ [A-Z][a-záéíóú]+)/
  );
  const customerName = customerMatch?.[1] ?? 'UNKNOWN';

  // Step 3: Extract Amount
  const amountMatch = rawText.match(/\\$[\\d,]+/);
  const amount = amountMatch?.[0] ?? '$0';

  // ACTION: Save the clean, structured data
  await saveToDatabase({
    order: orderNumber,
    customer: customerName,
    amount
  });

  console.log(\`✅ Extracted: \${orderNumber}, \${customerName}, \${amount}\`);
});

// 💡 Data extraction turns chaos into order — a key automation skill!
`,
    n8n: `{
  "name": "Email Data Extractor",
  "nodes": [
    {
      "name": "Email Trigger",
      "type": "n8n-nodes-base.emailReadImap",
      "position": [250, 300],
      "parameters": {
        "mailbox": "INBOX",
        "options": { "searchCriteria": "UNSEEN" }
      }
    },
    {
      "name": "Extract Order #",
      "type": "n8n-nodes-base.set",
      "position": [450, 300],
      "parameters": {
        "values": {
          "string": [{
            "name": "orderNumber",
            "value": "={{ $json.text.match(/ORD-\\\\d+/)?.[0] }}"
          }]
        }
      }
    },
    {
      "name": "Extract Customer",
      "type": "n8n-nodes-base.set",
      "position": [650, 300],
      "parameters": {
        "values": {
          "string": [{
            "name": "customer",
            "value": "={{ $json.text.match(/by ([A-Za-z ]+)/)?.[1] }}"
          }]
        }
      }
    },
    {
      "name": "Extract Amount",
      "type": "n8n-nodes-base.set",
      "position": [850, 300],
      "parameters": {
        "values": {
          "string": [{
            "name": "amount",
            "value": "={{ $json.text.match(/\\\\$[\\\\d,]+/)?.[0] }}"
          }]
        }
      }
    },
    {
      "name": "Save to Database",
      "type": "n8n-nodes-base.postgres",
      "position": [1050, 300],
      "parameters": {
        "operation": "insert",
        "table": "orders"
      }
    }
  ],
  "connections": {
    "Email Trigger": { "main": [[ { "node": "Extract Order #" } ]] },
    "Extract Order #": { "main": [[ { "node": "Extract Customer" } ]] },
    "Extract Customer": { "main": [[ { "node": "Extract Amount" } ]] },
    "Extract Amount": { "main": [[ { "node": "Save to Database" } ]] }
  }
}
`,
    pseudocode: `AUTOMATION: Email Data Extractor

# 💡 TRIGGER = the event that kicks off your automation
WHEN email_is_received:
    RECEIVE raw_text FROM email.body

    # 💡 DATA EXTRACTION = pulling clean values from messy input
    EXTRACT order_number MATCHING "ORD-####" FROM raw_text
    EXTRACT customer_name MATCHING "placed by [Name]" FROM raw_text
    EXTRACT amount MATCHING "$###" FROM raw_text

    # 💡 ACTION = what you do with the extracted data
    DO save_to_database(order_number, customer_name, amount)

    LOG "Extracted: {order_number}, {customer_name}, {amount}"
END

# 💡 Data extraction is the bridge between messy real-world data
# and clean, structured information your systems can use
`,
  },
};
