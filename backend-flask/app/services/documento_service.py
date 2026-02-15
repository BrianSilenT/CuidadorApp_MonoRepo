import os
from werkzeug.utils import secure_filename
from flask import current_app
from app.extensions import db
from app.models.documento import Documento

EXTENSIONES_PERMITIDAS = {"pdf", "png", "jpg", "jpeg"}
TIPOS_VALIDOS = {"cedula", "certificado", "antecedentes"}


def extension_permitida(nombre_archivo):
    if "." not in nombre_archivo:
        return False
    extension = nombre_archivo.rsplit(".", 1)[1].lower()
    return extension in EXTENSIONES_PERMITIDAS


def subir_documento(archivo, cuidador_id, tipo_documento):
    # Validar tipo de documento
    if tipo_documento not in TIPOS_VALIDOS:
        return {"error": f"Tipo de documento inválido. Tipos válidos: {', '.join(TIPOS_VALIDOS)}"}, 400

    # Validar que se envió un archivo
    if not archivo or archivo.filename == "":
        return {"error": "No se envió ningún archivo"}, 400

    # Validar extensión
    if not extension_permitida(archivo.filename):
        return {"error": f"Extensión no permitida. Use: {', '.join(EXTENSIONES_PERMITIDAS)}"}, 400

    # Crear nombre seguro para el archivo
    nombre_seguro = secure_filename(archivo.filename)
    nombre_final = f"cuidador_{cuidador_id}_{tipo_documento}_{nombre_seguro}"

    # Guardar el archivo en la carpeta uploads
    carpeta = current_app.config["UPLOAD_FOLDER"]
    if not os.path.exists(carpeta):
        os.makedirs(carpeta)

    ruta_completa = os.path.join(carpeta, nombre_final)
    archivo.save(ruta_completa)

    # Guardar registro en la base de datos
    documento = Documento(
        nombre_archivo=nombre_final,
        tipo_documento=tipo_documento,
        ruta_archivo=ruta_completa,
        cuidador_id=cuidador_id
    )
    db.session.add(documento)
    db.session.commit()

    return documento.to_dict(), 201


def obtener_documentos_por_cuidador(cuidador_id):
    documentos = Documento.query.filter_by(cuidador_id=cuidador_id).all()
    listado = []
    for d in documentos:
        listado.append(d.to_dict())
    return listado


def eliminar_documento(id):
    documento = Documento.query.get(id)
    if not documento:
        return {"error": "Documento no encontrado"}, 404

    # Eliminar archivo del disco
    if os.path.exists(documento.ruta_archivo):
        os.remove(documento.ruta_archivo)

    # Eliminar registro de la BD
    db.session.delete(documento)
    db.session.commit()

    return {"mensaje": "Documento eliminado correctamente"}, 200
