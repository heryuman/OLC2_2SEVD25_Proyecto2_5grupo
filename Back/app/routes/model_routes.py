from flask import Blueprint, jsonify, request
from app.services.model_service import (
 training_model   
)

model_bp = Blueprint("model", __name__)

@model_bp.get("/training")
def init_training():
    hyperp1=[4,42,10]
    hyperp2=[3,42,10]
    return training_model(hyperp1,hyperp2)

