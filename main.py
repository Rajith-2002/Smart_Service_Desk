from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from routers.auth_router import router
from database import test_db_connection
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()
import os

os.makedirs("uploads/tickets", exist_ok=True)


# include auth router
app.include_router(router)

# templates & static
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


from routers import faq
from routers import users
from routers import kb
from routers.agent import router as agent_router
from routers.ticket_router import router as ticket_router
from routers.agent_ticket_router import router as agent_ticket_router
app.include_router(agent_ticket_router)
app.include_router(ticket_router)

app.include_router(agent_router)

app.include_router(kb.router)

app.include_router(faq.router)
app.include_router(users.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# --------------------
# Pages
# --------------------
from fastapi.staticfiles import StaticFiles

app.mount("/data", StaticFiles(directory="data"), name="data")
@app.get("/")
def home_page(request: Request):
    return templates.TemplateResponse(
        "home.html",
        {"request": request}
    )

@app.get("/login")
def login_page(request: Request):
    return templates.TemplateResponse(
        "login.html",
        {"request": request}
    )


@app.get("/register")
def register_page(request: Request):
    return templates.TemplateResponse(
        "register.html",
        {"request": request}
    )

@app.get("/dashboard/customer")
def customer_dashboard(request: Request):
    return templates.TemplateResponse(
        "dashboard_customer.html",
        {"request": request}
    )

@app.get("/dashboard/agent")
def agent_dashboard(request: Request):
    return templates.TemplateResponse(
        "dashboard_agent.html",
        {"request": request}
    )

@app.get("/dashboard/admin")
def admin_dashboard(request: Request):
    return templates.TemplateResponse(
        "dashboard_admin.html",
        {"request": request}
    )

@app.get("/dashboard/agent/ticket")
def agent_ticket_page(request: Request):
    return templates.TemplateResponse(
        "agent_ticket.html",
        {"request": request}
    )


# --------------------
# DB health check
# --------------------

@app.get("/db-check")
def db_check():
    if test_db_connection():
        return {"status": "DB connection successful"}
    return {"status": "DB connection failed"}

