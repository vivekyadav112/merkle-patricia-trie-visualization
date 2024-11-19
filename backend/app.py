from flask import Flask, request, jsonify
from flask_cors import CORS
import networkx as nx

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication


class MerklePatriciaTrie:
    def __init__(self):
        self.data = {}

    def insert(self, key, value):
        self.data[key] = value

    def delete(self, key):
        self.data.pop(key, None)

    def modify(self, key, new_value):
        if key in self.data:
            self.data[key] = new_value

    def visualize(self):
        output = {"nodes": [], "edges": []}
        for key, value in self.data.items():
            current = "root"
            output["nodes"].append({"id": current, "label": "root"})
            for char in key:
                next_node = f"{current}/{char}"
                if not any(node["id"] == next_node for node in output["nodes"]):
                    output["nodes"].append({"id": next_node, "label": char})
                output["edges"].append({"from": current, "to": next_node})
                current = next_node
            # Add value node
            value_node = f"{current}: {value}"
            output["nodes"].append({"id": value_node, "label": value})
            output["edges"].append({"from": current, "to": value_node})
        return output


mpt = MerklePatriciaTrie()


@app.route('/insert', methods=['POST'])
def insert_key_value():
    data = request.json
    key = data.get("key")
    value = data.get("value")
    if key and value:
        mpt.insert(key, value)
    return jsonify({"message": "Key-Value inserted successfully"})


@app.route('/delete', methods=['POST'])
def delete_key_value():
    data = request.json
    key = data.get("key")
    if key:
        mpt.delete(key)
    return jsonify({"message": "Key deleted successfully"})


@app.route('/modify', methods=['POST'])
def modify_key_value():
    data = request.json
    key = data.get("key")
    value = data.get("value")
    if key and value:
        mpt.modify(key, value)
    return jsonify({"message": "Key-Value modified successfully"})


@app.route('/visualize', methods=['GET'])
def visualize_trie():
    return jsonify(mpt.visualize())


if __name__ == '__main__':
    app.run(debug=True)

