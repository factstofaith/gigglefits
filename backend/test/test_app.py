from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="TAP Integration Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data models
class Application(BaseModel):
    id: int
    name: str
    description: str
    status: str
    version: str
    users_count: int
    last_updated: str

class Dataset(BaseModel):
    id: int
    name: str
    source: str
    size: str
    last_sync: str
    status: str

# Mock data
applications = [
    {
        "id": 1,
        "name": "CRM Integration",
        "description": "Customer relationship management integration",
        "status": "active",
        "version": "1.2.0",
        "users_count": 45,
        "last_updated": "2025-03-15"
    },
    {
        "id": 2,
        "name": "ERP Connector",
        "description": "Enterprise resource planning connector",
        "status": "maintenance",
        "version": "2.0.1",
        "users_count": 32,
        "last_updated": "2025-03-10"
    },
    {
        "id": 3,
        "name": "HR System Integration",
        "description": "Human resources system integration",
        "status": "inactive",
        "version": "0.9.5",
        "users_count": 0,
        "last_updated": "2025-02-28"
    }
]

datasets = [
    {
        "id": 1,
        "name": "Customer Data",
        "source": "CRM System",
        "size": "2.4 GB",
        "last_sync": "2025-03-21",
        "status": "synced"
    },
    {
        "id": 2,
        "name": "Inventory Data",
        "source": "ERP System",
        "size": "1.8 GB",
        "last_sync": "2025-03-18",
        "status": "synced"
    },
    {
        "id": 3,
        "name": "Employee Records",
        "source": "HR System",
        "size": "0.7 GB",
        "last_sync": "2025-02-28",
        "status": "failed"
    }
]

# API Routes
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}

@app.get("/api/applications", response_model=List[Application])
def get_applications():
    return applications

@app.get("/api/applications/{app_id}", response_model=Application)
def get_application(app_id: int):
    for app in applications:
        if app["id"] == app_id:
            return app
    raise HTTPException(status_code=404, detail="Application not found")

@app.get("/api/datasets", response_model=List[Dataset])
def get_datasets():
    return datasets

@app.get("/api/datasets/{dataset_id}", response_model=Dataset)
def get_dataset(dataset_id: int):
    for dataset in datasets:
        if dataset["id"] == dataset_id:
            return dataset
    raise HTTPException(status_code=404, detail="Dataset not found")

# Run the application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)