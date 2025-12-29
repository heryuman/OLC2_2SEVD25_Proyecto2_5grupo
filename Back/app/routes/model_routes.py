from flask import Blueprint, jsonify, request
from app.services.model_service import (
 training_model,get_stats 
)

model_bp = Blueprint("model", __name__)

@model_bp.get("/training")
def init_training():
    hyperp1=[5,42,20]
    hyperp2=[5,42,20]
    return training_model(hyperp1,hyperp2)

@model_bp.get("/stats")
def get__stats():

    return get_stats()

@model_bp.post("/set_stats")
def set_stas():
    params=request.json["hyperparameters"]
    if params:
        print(params["clientes"]["cluster"])
        lparams_c=[params["clientes"]["cluster"],params["clientes"]["random_state"],params["clientes"]["max_iter"]]
        lparams_r=[params["reseñas"]["cluster"],params["reseñas"]["random_state"],params["reseñas"]["max_iter"]]


    return training_model(lparams_c,lparams_r)