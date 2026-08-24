import os
import sys
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Request, Depends, HTTPException, Header, status
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

# Import models & database with flexible fallback
try:
    from database import engine, Base, get_db
    from models import (
        Inquiry, InquiryCreate, InquiryResponse, StatusUpdateRequest,
        VisitorEvent, AnalyticsEventCreate
    )
except ModuleNotFoundError:
    from projects.levitas_enterprise.database import engine, Base, get_db
    from projects.levitas_enterprise.models import (
        Inquiry, InquiryCreate, InquiryResponse, StatusUpdateRequest,
        VisitorEvent, AnalyticsEventCreate
    )

# Initialize database schema safely
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[!] Warning: Database schema creation error: {e}")

# Initialize FastAPI application
app = FastAPI(
    title="Levitas Enterprise Intelligence & Technology",
    description="Next-Gen AI Systems & Enterprise Software Engineering Platform",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directories resolution with multiple fallbacks
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_STATIC_DIRS = [
    os.path.join(BASE_DIR, "static"),
    os.path.join(BASE_DIR, "projects", "levitas_enterprise", "static"),
    os.path.join(os.getcwd(), "projects", "levitas_enterprise", "static"),
    os.path.join(os.getcwd(), "static")
]
STATIC_DIR = next((d for d in POSSIBLE_STATIC_DIRS if os.path.exists(d)), os.path.join(BASE_DIR, "static"))

POSSIBLE_TEMPLATE_DIRS = [
    os.path.join(BASE_DIR, "templates"),
    os.path.join(BASE_DIR, "projects", "levitas_enterprise", "templates"),
    os.path.join(os.getcwd(), "projects", "levitas_enterprise", "templates"),
    os.path.join(os.getcwd(), "templates")
]
TEMPLATES_DIR = next((d for d in POSSIBLE_TEMPLATE_DIRS if os.path.exists(d)), os.path.join(BASE_DIR, "templates"))

# Mount static files and templates
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

try:
    templates = Jinja2Templates(directory=TEMPLATES_DIR)
except Exception as e:
    print(f"[!] Jinja2Templates init error: {e}")
    templates = None

# App configuration
VERSION = "v7.46.0"
WHATSAPP_PHONE = os.environ.get("WHATSAPP_PHONE", "905555105635")
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "contact@levitas.engineering")
ADMIN_KEY = os.environ.get("ADMIN_KEY", "levitas2026")

# Dependency for admin authentication
def verify_admin_key(
    x_admin_key: Optional[str] = Header(None),
    admin_key: Optional[str] = None
):
    provided_key = x_admin_key or admin_key
    if provided_key != ADMIN_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz Yönetici Anahtarı / Unauthorized Admin Key"
        )
    return True


# ==========================================
# PAGE & SYSTEM ROUTES
# ==========================================

@app.get("/robots.txt", response_class=PlainTextResponse)
async def serve_robots_txt():
    """Block search engines from crawling the unlisted administration portal."""
    content = (
        "User-agent: *\n"
        "Disallow: /admin\n"
        "Disallow: /api/admin/\n"
        "Allow: /\n"
    )
    return PlainTextResponse(content=content)

@app.get("/", response_class=HTMLResponse)
async def serve_home(request: Request):
    """Serve the luxury Levitas Enterprise landing page."""
    context = {
        "request": request,
        "version": VERSION,
        "whatsapp_phone": WHATSAPP_PHONE,
        "current_year": datetime.utcnow().year
    }
    if templates:
        try:
            return templates.TemplateResponse("index.html", context)
        except Exception:
            pass
            
    # Direct file read fallback
    for tpath in [
        os.path.join(TEMPLATES_DIR, "index.html"),
        os.path.join(BASE_DIR, "templates", "index.html"),
        os.path.join(os.getcwd(), "templates", "index.html"),
        os.path.join(os.getcwd(), "projects", "levitas_enterprise", "templates", "index.html")
    ]:
        if os.path.exists(tpath):
            with open(tpath, "r", encoding="utf-8") as f:
                content = f.read()
                content = content.replace("{{ version }}", VERSION)
                content = content.replace("{{ whatsapp_phone }}", WHATSAPP_PHONE)
                content = content.replace("{{ current_year }}", str(datetime.utcnow().year))
                return HTMLResponse(content=content)
                
    return HTMLResponse(content="<h1>Levitas Enterprise Intelligence & Technology</h1><p>Platform Active.</p>")

@app.get("/admin", response_class=HTMLResponse)
async def serve_admin(request: Request):
    """Serve the enterprise inquiry administration dashboard."""
    context = {
        "request": request,
        "version": VERSION,
        "current_year": datetime.utcnow().year
    }
    if templates:
        try:
            return templates.TemplateResponse("admin.html", context)
        except Exception:
            pass
            
    # Direct file read fallback
    for tpath in [
        os.path.join(TEMPLATES_DIR, "admin.html"),
        os.path.join(BASE_DIR, "templates", "admin.html"),
        os.path.join(os.getcwd(), "templates", "admin.html"),
        os.path.join(os.getcwd(), "projects", "levitas_enterprise", "templates", "admin.html")
    ]:
        if os.path.exists(tpath):
            with open(tpath, "r", encoding="utf-8") as f:
                content = f.read()
                content = content.replace("{{ version }}", VERSION)
                content = content.replace("{{ current_year }}", str(datetime.utcnow().year))
                return HTMLResponse(content=content)
                
    return HTMLResponse(content="<h1>Levitas Enterprise Admin</h1><p>Panel Active.</p>")


# ==========================================
# PUBLIC API ENDPOINTS
# ==========================================

@app.post("/api/analytics/track", status_code=status.HTTP_200_OK)
async def track_visitor_event(
    payload: AnalyticsEventCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Lightweight event tracking for visitor analytics and funnel conversion."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")[:500]
    
    event = VisitorEvent(
        event_type=payload.event_type.strip().lower(),
        path=payload.path or "/",
        referrer=payload.referrer[:255] if payload.referrer else None,
        user_agent=user_agent,
        device_type=payload.device_type or "desktop",
        meta_data=payload.meta_data or {},
        ip_address=client_ip
    )
    db.add(event)
    db.commit()
    return {"status": "ok", "event_id": event.id}


@app.post("/api/inquiry", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    payload: InquiryCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Receive and store new enterprise project inquiries."""
    client_ip = request.client.host if request.client else None
    
    new_inquiry = Inquiry(
        full_name=payload.full_name.strip(),
        company_name=payload.company_name.strip() if payload.company_name else None,
        email=payload.email.strip().lower(),
        phone=payload.phone.strip() if payload.phone else None,
        project_type=payload.project_type.strip(),
        budget_range=payload.budget_range.strip() if payload.budget_range else "Belirtilmedi",
        timeline_preference=payload.timeline_preference.strip() if payload.timeline_preference else "Standart",
        selected_features=payload.selected_features or [],
        project_details=payload.project_details.strip(),
        status="YENİ",
        ip_address=client_ip
    )
    
    db.add(new_inquiry)
    
    # Auto log analytics event
    auto_event = VisitorEvent(
        event_type="form_submit",
        path="/api/inquiry",
        device_type="web",
        meta_data={"project_type": payload.project_type, "budget_range": payload.budget_range},
        ip_address=client_ip
    )
    db.add(auto_event)
    
    db.commit()
    db.refresh(new_inquiry)
    
    return new_inquiry


@app.get("/api/health")
async def health_check():
    """System health check and diagnostic endpoint."""
    return {
        "status": "healthy",
        "service": "Levitas Enterprise Intelligence & Technology",
        "version": VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    }


# ==========================================
# ADMIN API ENDPOINTS (PROTECTED)
# ==========================================

@app.get("/api/admin/analytics/summary")
async def get_analytics_summary(
    key: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Executive visitor analytics summary and conversion metrics."""
    verify_admin_key(x_admin_key=x_admin_key, admin_key=key)
    
    total_events = db.query(VisitorEvent).count()
    pageviews = db.query(VisitorEvent).filter(VisitorEvent.event_type == "pageview").count()
    calc_uses = db.query(VisitorEvent).filter(VisitorEvent.event_type == "calc_use").count()
    form_submits = db.query(VisitorEvent).filter(VisitorEvent.event_type == "form_submit").count()
    total_inquiries = db.query(Inquiry).count()
    
    # Device breakdown
    mobile_count = db.query(VisitorEvent).filter(VisitorEvent.device_type == "mobile").count()
    desktop_count = db.query(VisitorEvent).filter(VisitorEvent.device_type == "desktop").count()
    
    # Conversion Rate
    conversion_rate = round((total_inquiries / pageviews * 100), 2) if pageviews > 0 else 0.0
    
    # Recent events stream (last 15)
    recent_events_raw = db.query(VisitorEvent).order_by(desc(VisitorEvent.created_at)).limit(15).all()
    recent_events = [
        {
            "id": ev.id,
            "event_type": ev.event_type,
            "path": ev.path,
            "device_type": ev.device_type,
            "ip_address": ev.ip_address or "—",
            "meta_data": ev.meta_data or {},
            "created_at": ev.created_at.strftime("%d.%m.%Y %H:%M:%S") if ev.created_at else ""
        }
        for ev in recent_events_raw
    ]
    
    # Architecture interest distribution
    inquiries = db.query(Inquiry).all()
    arch_counts = {}
    for inq in inquiries:
        ptype = inq.project_type or "Diğer"
        arch_counts[ptype] = arch_counts.get(ptype, 0) + 1
        
    return {
        "pageviews": pageviews,
        "calc_uses": calc_uses,
        "form_submits": form_submits,
        "total_inquiries": total_inquiries,
        "conversion_rate": conversion_rate,
        "device_breakdown": {
            "mobile": mobile_count,
            "desktop": desktop_count
        },
        "arch_counts": arch_counts,
        "recent_events": recent_events
    }


@app.get("/api/admin/inquiries", response_model=List[InquiryResponse])
async def list_inquiries(
    key: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None),
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all submitted inquiries with optional status filtering."""
    verify_admin_key(x_admin_key=x_admin_key, admin_key=key)
    
    query = db.query(Inquiry).order_by(desc(Inquiry.created_at))
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Inquiry.status == status_filter.upper())
        
    return query.all()


@app.patch("/api/admin/inquiries/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: int,
    payload: StatusUpdateRequest,
    key: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Update status or administrative notes for a specific inquiry."""
    verify_admin_key(x_admin_key=x_admin_key, admin_key=key)
    
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Talep kaydı bulunamadı / Inquiry not found")
        
    inquiry.status = payload.status.upper()
    if payload.admin_notes is not None:
        inquiry.admin_notes = payload.admin_notes
    inquiry.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(inquiry)
    return {"message": "Talep durumu güncellendi", "inquiry": inquiry.id, "status": inquiry.status}


@app.delete("/api/admin/inquiries/{inquiry_id}")
async def delete_inquiry(
    inquiry_id: int,
    key: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Delete an inquiry record."""
    verify_admin_key(x_admin_key=x_admin_key, admin_key=key)
    
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Talep kaydı bulunamadı")
        
    db.delete(inquiry)
    db.commit()
    return {"message": f"Talep #{inquiry_id} başarıyla silindi"}


# ==========================================
# SERVER RUNNER (PORT SAFE)
# ==========================================
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT") or 8080)
    print(f"[*] Levitas Enterprise başlatılıyor... Port: {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

