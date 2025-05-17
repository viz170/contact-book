# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel

# app = FastAPI()

# origins = ["http://localhost:3000"]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class Contact(BaseModel):
#     name: str
#     email: str

# contacts = []

# @app.get("/contacts")
# def get_contacts():
#     return contacts

# @app.post("/contacts")
# def add_contact(contact: Contact):
#     contacts.append(contact)
#     return {"message": "Contact added successfully"}

# @app.delete("/contacts/{email}")
# def delete_contact(email: str):
#     global contacts
#     contacts = [c for c in contacts if c.email != email]
#     return {"message": "Deleted"}







from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from sqlalchemy import create_engine, Column, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

app = FastAPI()

# Allow CORS for local development
origins = ["http://localhost:3000", "https://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite database setup
DATABASE_URL = "sqlite:///./contacts.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy model
class ContactDB(Base):
    __tablename__ = "contacts"
    email = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)

Base.metadata.create_all(bind=engine)

# Pydantic model
class Contact(BaseModel):
    name: str
    email: EmailStr

# Get all contacts or search by name
@app.get("/contacts", response_model=List[Contact])
def get_contacts(name: Optional[str] = Query(None)):
    db = SessionLocal()
    try:
        if name:
            contacts = db.query(ContactDB).filter(ContactDB.name.contains(name)).all()
        else:
            contacts = db.query(ContactDB).all()
        return contacts
    finally:
        db.close()

# Add a new contact
@app.post("/contacts")
def add_contact(contact: Contact):
    db = SessionLocal()
    try:
        existing = db.query(ContactDB).filter(ContactDB.email == contact.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Contact already exists")
        db_contact = ContactDB(email=contact.email, name=contact.name)
        db.add(db_contact)
        db.commit()
        return {"message": "Contact added successfully"}
    finally:
        db.close()

# Update a contact by email
@app.put("/contacts/{email}")
def update_contact(email: str, updated_contact: Contact):
    db = SessionLocal()
    try:
        contact = db.query(ContactDB).filter(ContactDB.email == email).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        contact.name = updated_contact.name
        contact.email = updated_contact.email
        db.commit()
        return {"message": "Contact updated successfully"}
    finally:
        db.close()

# Delete a contact by email
@app.delete("/contacts/{email}")
def delete_contact(email: str):
    db = SessionLocal()
    try:
        contact = db.query(ContactDB).filter(ContactDB.email == email).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")
        db.delete(contact)
        db.commit()
        return {"message": "Deleted"}
    finally:
        db.close()
