import json

try:
    with open('logs_result.json', 'r', encoding='utf-8') as f:
        logs = json.load(f)

    # Find POST requests to /api/chat
    post_requests = [
        log for log in logs 
        if log.get('requestMethod') == 'POST' and '/api/chat' in log.get('requestPath', '')
    ]

    print(f"Found {len(post_requests)} POST requests to /api/chat")

    # Analyze the most recent 3 POST requests
    for i, post_req in enumerate(post_requests[:3]):
        request_id = post_req.get('requestId')
        print(f"\n--- POST Request {i+1} (ID: {request_id}) ---")
        print(f"Timestamp: {post_req.get('TimeUTC')}")
        
        # Find all logs with this requestId
        related_logs = [
            log for log in logs 
            if log.get('requestId') == request_id
        ]
        
        # Sort by timestamp
        related_logs.sort(key=lambda x: x.get('timestampInMs', 0))
        
        for log in related_logs:
            msg = log.get('message', '')
            if 'prisma:query' in msg:
                print(f"DB Query: {msg}")
            elif log.get('requestMethod') == 'POST':
                print(f"Request: {log.get('requestMethod')} {log.get('requestPath')}")
            else:
                print(f"Log: {msg}")

except Exception as e:
    print(f"Error: {e}")
