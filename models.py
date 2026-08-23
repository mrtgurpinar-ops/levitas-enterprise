from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON
from pydantic import BaseModel, EmailStr, Field
from database import Base

# SQLAlchemy Database Model
class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    project_type = Column(String(100), nullable=False)
    budget_range = Column(String(100), nullable=True)
    timeline_preference = Column(String(100), nullable=True)
    selected_features = Column(JSON, nullable=True)
    project_details = Column(Text, nullable=False)
    status = Column(String(50), default="YENİ")  # YENİ, İNCELENİYOR, TEKLİF_VERİLDİ, ONAYLANDI, ARŞİV
    admin_notes = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Pydantic Schemas for Request/Response Validation
class InquiryCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255, description="Yetkili Kişi Adı Soyadı")
    company_name: Optional[str] = Field(None, max_length=255, description="Şirket / Marka Adı")
    email: EmailStr = Field(..., description="Kurumsal E-posta Adresi")
    phone: Optional[str] = Field(None, max_length=50, description="Telefon / WhatsApp Numarası")
    project_type: str = Field(..., min_length=2, max_length=100, description="Proje / Çözüm Türü")
    budget_range: Optional[str] = Field(None, description="Tahmini Bütçe Aralığı")
    timeline_preference: Optional[str] = Field(None, description="Hedef Teslimat Süresi")
    selected_features: Optional[List[str]] = Field(default=[], description="Seçilen Teknik Özellikler")
    project_details: str = Field(..., min_length=5, description="Proje Detayları ve İhtiyaç Özeti")

class InquiryResponse(BaseModel):
    id: int
    full_name: str
    company_name: Optional[str]
    email: str
    phone: Optional[str]
    project_type: str
    budget_range: Optional[str]
    timeline_preference: Optional[str]
    selected_features: Optional[List[str]]
    project_details: str
    status: str
    admin_notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class StatusUpdateRequest(BaseModel):
    status: str
    admin_notes: Optional[str] = None
