from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import cv2
import numpy as np

app = Flask(__name__)

# Load the pre-trained model
model = load_model('final.h5')

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['file']
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_UNCHANGED)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (28, 28))
    img_gray = cv2.cvtColor(img_resized, cv2.COLOR_RGB2GRAY)
    final_img = np.expand_dims(img_gray, axis=-1)
    final_img = np.expand_dims(final_img, axis=0)
    final_img = final_img.astype('float32') / 255.0

    # Make prediction
    prediction = model.predict(final_img)

    # Get the predicted class
    predicted_class = np.argmax(prediction)

    return jsonify({'predicted_class': predicted_class})

if __name__ == '__main__':
    app.run(debug=True)
