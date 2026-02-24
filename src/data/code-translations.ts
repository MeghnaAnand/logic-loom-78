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

def on_form_submitted(form_data):
    """Triggered when a new form is submitted."""
    name = form_data["name"]
    email = form_data["email"]

    # Action: Save to spreadsheet
    save_to_spreadsheet({
        "name": name,
        "email": email,
        "timestamp": datetime.now()
    })

    print(f"✅ Saved {name} ({email}) to spreadsheet")
`,
    javascript: `// Level 1: Basic Automation
// Trigger: Form submission → Action: Save to Spreadsheet

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const name = formData.get('name');
  const email = formData.get('email');

  // Action: Save to spreadsheet
  await saveToSpreadsheet({
    name,
    email,
    timestamp: new Date().toISOString()
  });

  console.log(\`✅ Saved \${name} (\${email}) to spreadsheet\`);
});
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

WHEN form_is_submitted:
    RECEIVE name, email FROM form

    DO save_to_spreadsheet(name, email, current_time)

    LOG "Saved {name} ({email}) to spreadsheet"
END
`,
  },

  2: {
    python: `# Level 2: Smart Decisions
# Trigger: Order received → Condition: Check amount → Route

def on_order_received(order):
    """Triggered when a new order comes in."""
    amount = order["amount"]
    customer = order["customer"]

    # Condition: Check if amount > $500
    if amount > 500:
        # YES path: Send to manager for approval
        send_to_manager({
            "customer": customer,
            "amount": amount,
            "reason": "Large order - needs approval"
        })
        print(f"📋 Order {amount} sent to manager")
    else:
        # NO path: Auto-approve
        auto_approve_order(order)
        print(f"✅ Order {amount} auto-approved")
`,
    javascript: `// Level 2: Smart Decisions
// Trigger: Order received → Condition: Check amount → Route

orderSystem.on('orderReceived', async (order) => {
  const { amount, customer } = order;

  // Condition: Check if amount > $500
  if (amount > 500) {
    // YES path: Send to manager for approval
    await sendToManager({
      customer,
      amount,
      reason: 'Large order - needs approval'
    });
    console.log(\`📋 Order $\${amount} sent to manager\`);
  } else {
    // NO path: Auto-approve
    await autoApproveOrder(order);
    console.log(\`✅ Order $\${amount} auto-approved\`);
  }
});
`,
    n8n: `{
  "name": "Smart Order Router",
  "nodes": [
    {
      "name": "Order Received",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "new-order",
        "httpMethod": "POST"
      }
    },
    {
      "name": "IF Amount > 500",
      "type": "n8n-nodes-base.if",
      "position": [500, 300],
      "parameters": {
        "conditions": {
          "number": [{
            "value1": "={{ $json.amount }}",
            "operation": "larger",
            "value2": 500
          }]
        }
      }
    },
    {
      "name": "Send to Manager",
      "type": "n8n-nodes-base.slack",
      "position": [750, 200],
      "parameters": { "channel": "#approvals" }
    },
    {
      "name": "Auto-Approve",
      "type": "n8n-nodes-base.httpRequest",
      "position": [750, 400],
      "parameters": { "url": "https://api.shop.com/approve" }
    }
  ],
  "connections": {
    "Order Received": {
      "main": [[ { "node": "IF Amount > 500" } ]]
    },
    "IF Amount > 500": {
      "main": [
        [ { "node": "Send to Manager" } ],
        [ { "node": "Auto-Approve" } ]
      ]
    }
  }
}
`,
    pseudocode: `AUTOMATION: Smart Order Router

WHEN order_is_received:
    RECEIVE amount, customer FROM order

    IF amount > 500 THEN
        DO send_to_manager(customer, amount, "Needs approval")
        LOG "Order sent to manager"
    ELSE
        DO auto_approve(order)
        LOG "Order auto-approved"
    END IF
END
`,
  },

  3: {
    python: `# Level 3: Data Detective
# Trigger: Email → Extract Order → Extract Customer → Extract Amount → Save

import re

def on_email_received(email):
    """Triggered when an order confirmation email arrives."""
    raw_text = email["body"]

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

    # Action: Save structured data to database
    save_to_database({
        "order": order_number,
        "customer": customer_name,
        "amount": amount
    })

    print(f"✅ Extracted: {order_number}, {customer_name}, {amount}")
`,
    javascript: `// Level 3: Data Detective
// Trigger: Email → Extract Order → Extract Customer → Extract Amount → Save

emailService.on('newEmail', async (email) => {
  const rawText = email.body;

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

  // Action: Save structured data to database
  await saveToDatabase({
    order: orderNumber,
    customer: customerName,
    amount
  });

  console.log(\`✅ Extracted: \${orderNumber}, \${customerName}, \${amount}\`);
});
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

WHEN email_is_received:
    RECEIVE raw_text FROM email.body

    EXTRACT order_number MATCHING "ORD-####" FROM raw_text
    EXTRACT customer_name MATCHING "placed by [Name]" FROM raw_text
    EXTRACT amount MATCHING "$###" FROM raw_text

    DO save_to_database(order_number, customer_name, amount)

    LOG "Extracted: {order_number}, {customer_name}, {amount}"
END
`,
  },
};
