async function getInProgressEvents() {
    const resp = await fetch(`https://api.notion.com/v1/databases/${BASE_DATABASE_ID}/query`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${NOTION_TOKEN}`,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            filter: {
                "property": "종료됨",
                "checkbox": {
                    "equals": false
                }
            }
        }),
    })
        .then(resp => resp.json())
        .then(data => {
            return data;
        })
        .catch(err => {
            console.error('Error:', err);
        });

    // console.log(resp);
    return resp.results;
}

async function update_event_to_closed(page_id) {
    const resp = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${NOTION_TOKEN}`,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            properties: {
                "종료됨": {
                    "checkbox": true
                }
            }
        })
    })
        .then(resp => resp.json())
        .then(data => {
            return data;
        })
        .catch(err => {
            console.error('Error:', err);
        });
}


async function run() {
    const today = new Date();
    const inProgressEvents = await getInProgressEvents();

    for (const event of inProgressEvents) {
        // console.log(event.properties.competition_end_date)
        if (event.properties.competition_end_date.date === null) {
            continue;
        }
        const competition_end_date = new Date(event.properties.competition_end_date.date.start)
        if (today > competition_end_date) {
            // console.log(event);
            await update_event_to_closed(event.id)
        }
    }
}

run();

addEventListener('fetch', (event) => {
});

addEventListener('scheduled', (event) => {
    event.waitUntil(handleSchedule(event.request, event));
});

async function handleSchedule(request, event) {
    await run();
}