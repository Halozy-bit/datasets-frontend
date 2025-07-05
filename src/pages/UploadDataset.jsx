import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Save, Download, Edit } from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "../hooks/useAuth";
import { uploadDataset } from "../api/datasets";

export default function UploadDataset() {
  const [form, setForm] = useState({
    name: "",
    tags: "",
    source: "",
    description: "",
    license: "cc-by",
    visibility: "public",
    file: null,
  });
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [editablePreviewData, setEditablePreviewData] = useState(null);
  const [skipRows, setSkipRows] = useState(0);
  const [skipFooter, setSkipFooter] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isExcelFile, setIsExcelFile] = useState(false);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [allSheetsData, setAllSheetsData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const { auth } = useAuth();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file" && files && files[0]) {
      const file = files[0];
      const fileName = file.name.toLowerCase();
      const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

      setIsExcelFile(isExcel);
      setForm((f) => ({
        ...f,
        [name]: file,
      }));

      if (isExcel) {
        handleExcelPreview(file);
      } else {
        handleCSVPreview(file);
      }
    } else {
      setForm((f) => ({
        ...f,
        [name]: value,
      }));
    }
  };

  const handleCSVPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()));
      setPreviewData(rows);
      setEditablePreviewData(JSON.parse(JSON.stringify(rows))); // Deep copy
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  // Simulasi untuk Excel preview
  const handleExcelPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetNames = workbook.SheetNames;
      const allSheets = sheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      });

      setAvailableSheets(sheetNames);
      setAllSheetsData(allSheets);
      setSelectedSheet(0);
      setPreviewData(allSheets[0]);
      setEditablePreviewData(JSON.parse(JSON.stringify(allSheets[0])));
      setShowPreview(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSheetChange = (sheetIndex) => {
    setSelectedSheet(sheetIndex);
    const sheetData = allSheetsData[sheetIndex];
    setPreviewData(sheetData);
    setEditablePreviewData(JSON.parse(JSON.stringify(sheetData))); // Deep copy
    setSkipRows(0);
    setSkipFooter(0);
  };

  const getProcessedData = () => {
    if (!editablePreviewData) return null;

    const totalRows = editablePreviewData.length;
    const startRow = Math.max(0, skipRows);
    const endRow = Math.max(startRow + 1, totalRows - skipFooter);

    return editablePreviewData.slice(startRow, endRow);
  };

  const handleSkipChange = (type, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    if (type === "rows") {
      setSkipRows(numValue);
    } else {
      setSkipFooter(numValue);
    }
  };

  // Handle cell edit
  const handleCellEdit = (rowIndex, colIndex, value) => {
    const newData = [...editablePreviewData];
    newData[rowIndex][colIndex] = value;
    setEditablePreviewData(newData);
  };

  // Add new row
  const addNewRow = () => {
    if (!editablePreviewData || editablePreviewData.length === 0) return;

    const newData = [...editablePreviewData];
    const columnCount = newData[0].length;
    const newRow = new Array(columnCount).fill("");
    newData.push(newRow);
    setEditablePreviewData(newData);
  };

  // Delete row
  const deleteRow = (rowIndex) => {
    if (!editablePreviewData || editablePreviewData.length <= 1) return;

    const newData = editablePreviewData.filter(
      (_, index) => index !== rowIndex
    );
    setEditablePreviewData(newData);
  };

  // Add new column
  const addNewColumn = () => {
    if (!editablePreviewData) return;

    const newData = editablePreviewData.map((row) => [...row, ""]);
    setEditablePreviewData(newData);
  };

  // Delete column
  const deleteColumn = (colIndex) => {
    if (!editablePreviewData || editablePreviewData[0].length <= 1) return;

    const newData = editablePreviewData.map((row) =>
      row.filter((_, index) => index !== colIndex)
    );
    setEditablePreviewData(newData);
  };

  const convertDataToCSV = (data) => {
    if (!data || data.length === 0) return "";

    return data
      .map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell || "");
            if (
              cellStr.includes(",") ||
              cellStr.includes('"') ||
              cellStr.includes("\n")
            ) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      )
      .join("\n");
  };

  const convertDataToJSON = (data) => {
    if (!data || data.length === 0) return [];

    const processedData = getProcessedData();
    if (!processedData || processedData.length === 0) return [];

    const headers = processedData[0];
    const rows = processedData.slice(1);

    return rows.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });
  };

const createCSVFileFromEditedData = () => {
  const processed = getProcessedData();
  const csvContent = convertDataToCSV(processed);
  return new File([csvContent], "processed_dataset.csv", {
    type: "text/csv",
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  if (!form.file) {
    setError("Please select a file to upload.");
    return;
  }

  try {
    const formData = new FormData();
    const processedFile = createCSVFileFromEditedData();
    formData.append("file", processedFile);
    formData.append("name", form.name);
    formData.append("tags", form.tags);
    formData.append("source", form.source);
    formData.append("description", form.description);
    formData.append("license", form.license || "cc-by");
    formData.append("visibility", form.visibility || "public");

    await uploadDataset(formData, {
      username: auth?.username,
      password: auth?.password,
    });

    alert("Dataset uploaded successfully!");
  } catch (err) {
    console.error("Upload error:", err);
    setError("Failed to upload dataset. Please check your credentials and file format.");
  }
};


  const processedData = getProcessedData();
  const maxPreviewRows = 20;
  const previewRows = (() => {
    if (!processedData) return [];
    const total = processedData.length;

    if (total <= 40) return processedData;

    const head = processedData.slice(0, 20);
    const tail = processedData.slice(-20);
    return [...head, ["...", "...", "..."], ...tail];
  })();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">📤 Upload Dataset</h2>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dataset Name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Solar Power Data"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags{" "}
              <span className="text-xs text-gray-400">(comma separated)</span>
            </label>
            <Input
              id="tags"
              name="tags"
              placeholder="e.g. solar, climate"
              value={form.tags}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Source
            </label>
            <Input
              id="source"
              name="source"
              placeholder="e.g. PLN, BPPT"
              value={form.source}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="license"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              License
            </label>
            <Input
              id="license"
              name="license"
              placeholder="e.g. cc-by"
              value={form.license}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the dataset..."
            value={form.description}
            onChange={handleChange}
            required
            className="resize-none"
          />
        </div>

        <div>
          <label
            htmlFor="visibility"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            value={form.visibility}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="public">🌍 Public</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Upload File (.csv, .xlsx, .xls)
          </label>
          <Input
            id="file"
            name="file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleChange}
            required
          />
        </div>

        {/* Preview Controls */}
        {previewData && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                📊 Data Preview
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {isEditMode ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                  {isEditMode ? "View Mode" : "Edit Mode"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>
            </div>

            {/* Sheet Selection */}
            {availableSheets.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Sheet
                </label>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                >
                  {availableSheets.map((sheetName, index) => (
                    <option key={index} value={index}>
                      📋 {sheetName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skip Rows (from top)
                </label>
                <Input
                  type="number"
                  min="0"
                  max={editablePreviewData ? editablePreviewData.length - 1 : 0}
                  value={skipRows}
                  onChange={(e) => handleSkipChange("rows", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skip Footer (from bottom)
                </label>
                <Input
                  type="number"
                  min="0"
                  max={
                    editablePreviewData
                      ? editablePreviewData.length - skipRows - 1
                      : 0
                  }
                  value={skipFooter}
                  onChange={(e) => handleSkipChange("footer", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Total rows:{" "}
                {editablePreviewData ? editablePreviewData.length : 0} |
                Processed rows: {processedData ? processedData.length : 0}
              </span>
              {isEditMode && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewRow}
                  >
                    + Add Row
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewColumn}
                  >
                    + Add Column
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Editable Preview Table */}
        {showPreview && previewRows.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">
              {isEditMode ? "✏️ Editable Data Preview:" : "📋 Data Preview:"}
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                      Row
                    </th>
                    {previewRows[0] &&
                      previewRows[0].map((_, colIndex) => (
                        <th
                          key={colIndex}
                          className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <span>Col {colIndex + 1}</span>
                            {isEditMode && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteColumn(colIndex)}
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewRows.map((row, rowIndex) => {
                    const isEllipsisRow = row.every((cell) => cell === "...");
                    return (
                      <tr
                        key={rowIndex}
                        className={`${
                          rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } group`}
                      >
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                          {isEllipsisRow ? "…" : skipRows + rowIndex + 1}
                        </td>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 text-sm text-gray-500"
                          >
                            {isEditMode && !isEllipsisRow ? (
                              <Input
                                value={cell || ""}
                                onChange={(e) =>
                                  handleCellEdit(
                                    skipRows + rowIndex,
                                    cellIndex,
                                    e.target.value
                                  )
                                }
                                className="w-full min-w-[120px] text-sm"
                              />
                            ) : (
                              <span
                                className="block max-w-xs truncate"
                                title={String(cell || "")}
                              >
                                {String(cell || "")}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {processedData && processedData.length > maxPreviewRows && (
              <p className="text-sm text-gray-500 text-center">
                ... and {processedData.length - maxPreviewRows} more rows
              </p>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Upload Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4">
          <Button type="button" onClick={handleSubmit} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Upload Dataset
          </Button>
        </div>
      </div>
    </div>
  );
}
