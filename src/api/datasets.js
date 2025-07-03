import axios from "./axios";

// Login: panggil endpoint protektif untuk validasi Basic Auth
export function login(username, password) {
  return axios.get("/login", {
    auth: { username, password },
  });
}

// List all datasets (public + private)
export function getAllDatasets(auth) {
  return axios.get("/datasets", {
    auth,
  });
}

// List public datasets
export function getPublicDatasets() {
  return axios.get("/datasets/public");
}

// Get sample data from a dataset
export function getSampleData(collection_name) {
  return axios.get(`/dataset/${collection_name}`);
}

// Delete a dataset
export function deleteDataset(collection_name, auth) {
  return axios.delete(`/dataset/${collection_name}`, {
    auth,
  });
}

// Update dataset metadata
export function updateMetadata(collection_name, data, auth) {
  const form = new FormData();
  form.append("description", data.description);
  form.append("tags", data.tags);
  form.append("visibility", data.visibility);
  return axios.put(`/dataset/${collection_name}`, form, { auth });
}

// Get metadata of a dataset
export function getMetadata(collection_name) {
  return axios.get(`/dataset/${collection_name}/metadata`);
}

// Upload a dataset
export function uploadDataset(form, auth) {
  return axios.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    auth,
  });
}

export function downloadDataset(collection_name) {
  return axios.get(`/dataset/${collection_name}/download`, {
    responseType: "blob", // penting agar file diunduh sebagai blob
  });
}

