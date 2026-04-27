import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def upload_to_cloudinary(file, folder="codesign/courses"):
    """
    Uploads a file to Cloudinary and returns the secure URL.
    """
    try:
        response = cloudinary.uploader.upload(file, folder=folder)
        return response.get("secure_url")
    except Exception as e:
        print(f"Cloudinary Error: {e}")
        return None