from flask import Blueprint, jsonify, request
from app.services.model_service import (
 training_model   
)

model_bp = Blueprint("model", __name__)

@model_bp.get("/training")
def init_training():
    hyperp1=[5,42,20]
    hyperp2=[5,42,20]
    return training_model(hyperp1,hyperp2)

