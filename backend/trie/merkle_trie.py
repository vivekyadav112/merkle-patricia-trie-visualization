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
