from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from pymongo import MongoClient, IndexModel, ASCENDING
from bson import ObjectId
from datetime import datetime , timedelta
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import httpx
import logging
from dotenv import load_dotenv
load_dotenv()


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def ping_url():
    url = "https://serverpinger-z62t.onrender.com/"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            logger.info(f"Ping successful: {response.status_code}")
        except httpx.HTTPStatusError as e:
            logger.error(f"Ping failed: {e}")

# Setup the scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(
    ping_url,
    IntervalTrigger(minutes=10),  # Trigger every 10 minutes
    id='ping_job',
    name='Ping the rides URL every 10 minutes',
    replace_existing=True
)
scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

MONGO_USR=os.getenv("MONGO_USR")
MONGO_PASS=os.getenv("MONGO_PASS")
SECRET_KEY = os.getenv("SECRET_KEY")
ALLOWED_CORS=os.getenv("ALLOWED_CORS")
print(ALLOWED_CORS  )

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_CORS],  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)




client = MongoClient("mongodb+srv://"+MONGO_USR+":"+MONGO_PASS+"@cluster0.tuw5ikl.mongodb.net")
db = client['RideShare']
rides_collection = db['rides']
users_collection = db.get_collection("users")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

ALGORITHM = "HS256"


rides_collection.create_indexes([
    IndexModel([("created_at", ASCENDING)], expireAfterSeconds=900)
])


class Ride(BaseModel):
    host: str
    destination: str
    pickup: str
    time: datetime
    created_at: datetime = None
    phone_no:str
    email:str

class RideInDB(Ride):
    id: str



class User(BaseModel):
    name:str
    email: str
    phone_no:str
    password: str

class UserInLogin(BaseModel):
    email:str
    password:str
    

class UserInDB(User):
    hashed_password: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/signup")
async def sign_up(user: User):
    user_in_db = users_collection.find_one({"email": user.email})
    if user_in_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    users_collection.insert_one({"name":user.name,"email": user.email, "hashed_password": hashed_password , "phone_no":user.phone_no})
    return {"msg": "User created successfully"}

@app.post("/login")
async def login(user: UserInLogin):
    user_in_db = users_collection.find_one({"email": user.email})
    if not user_in_db or not verify_password(user.password, user_in_db["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(data={"email": user_in_db["email"],"name": user_in_db["name"], "phone_no": user_in_db["phone_no"]})
    return {"token": access_token}

# Helper function to convert MongoDB document to Pydantic model
def ride_helper(ride) -> RideInDB:
    return RideInDB(
        id=str(ride["_id"]),
        host=ride["host"],
        destination=ride["destination"],
        pickup=ride["pickup"],
        time=ride["time"],
        created_at=ride["created_at"],
        phone_no=ride["phone_no"],
        email=ride["email"]

    )

@app.post("/rides", response_model=RideInDB)
async def create_ride(ride: Ride):
    # Check if there's an active ride by the same user
    existing_ride = rides_collection.find_one({ 
        "email": ride.phone_no,
        "created_at": {"$gte": datetime.utcnow() - timedelta(minutes=15)}
    })
    
    if existing_ride:
        raise HTTPException(status_code=400, detail="User already has an active ride.")

    # If no active ride exists, create the new ride
    ride.created_at = datetime.utcnow()  # Set the current UTC time
    ride_dict = ride.dict()
    result = rides_collection.insert_one(ride_dict)
    new_ride = rides_collection.find_one({"_id": result.inserted_id})
    
    return ride_helper(new_ride)

@app.get("/rides", response_model=List[RideInDB])
async def get_rides():
    rides = rides_collection.find()
    return [ride_helper(ride) for ride in rides]

@app.get("/rides/{ride_id}", response_model=RideInDB)
async def get_ride(ride_id: str):
    ride = rides_collection.find_one({"_id": ObjectId(ride_id)})
    if ride is None:
        raise HTTPException(status_code=404, detail="Ride not found")
    return ride_helper(ride)

@app.put("/rides/{ride_id}", response_model=RideInDB)
async def update_ride(ride_id: str, ride: Ride):
    updated_ride = rides_collection.find_one_and_update(
        {"_id": ObjectId(ride_id)},
        {"$set": ride.dict()},
        return_document=True
    )
    if updated_ride is None:
        raise HTTPException(status_code=404, detail="Ride not found")
    return ride_helper(updated_ride)

@app.delete("/rides/{phone_no}")
async def delete_ride(phone_no: str):
    result = rides_collection.delete_one({"phone_no": phone_no})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ride not found")
    return {"message": "Ride deleted successfully"}

