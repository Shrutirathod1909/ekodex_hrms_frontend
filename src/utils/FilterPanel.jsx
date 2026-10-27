import React from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { FaPlus, FaTimes } from "react-icons/fa";

const getProcessedSuggestions = (keyword, suggestionsList) => {
  if (!keyword || !suggestionsList) return [];
  
  const lowerKeyword = keyword.toLowerCase().trim();
  const words = lowerKeyword.split(/\s+/);
  
  return suggestionsList
    .map(suggestion => {
      const lowerSuggestion = suggestion.toLowerCase();
      let score = 0;
      
      words.forEach(word => {
        if (lowerSuggestion.includes(word)) score += 10;
        if (lowerSuggestion.startsWith(word)) score += 5;
      });
      
      if (lowerSuggestion.includes(lowerKeyword)) score += 50;
      
      return { text: suggestion, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.text);
};

const FilterPanel = ({
  searchFields,
  setSearchFields,
  dateFilter,
  setDateFilter,
    companies = [],
  branches = [],
  selectedCompany = "",
  selectedBranch = "",
  onCompanyChange,
  onBranchChange,

  // monthYearFilter,
  // setMonthYearFilter,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  onSearch,
  onReset,
  onDownloadExcel,
  searchOptions,
  filterMode = "date",
  showDownload = true,
  suggestions = [],
  onSuggestionClick = null,
}) => {
  const [focusedIndex, setFocusedIndex] = React.useState(null);

  // const handleFieldChange = (index, e) => {
  //   const updated = [...searchFields];
  //   updated[index][e.target.name] = e.target.value;
  //   setSearchFields(updated);
  // };

  const handleFieldChange = (index, e) => {
    const updated = [...searchFields];

    // Apply .trim() to the value if the field name is 'keyword'
    const value =
      e.target.name === "keyword" ? e.target.value.trimStart() : e.target.value;

    updated[index][e.target.name] = value;
    setSearchFields(updated);
  };

  const addField = () => {
    setSearchFields([
      ...searchFields,
      { field: searchOptions[0]?.value || "", keyword: "" },
    ]);
  };

  const removeField = (index) => {
    setSearchFields(searchFields.filter((_, i) => i !== index));
  };

  const getAvailableOptions = (currentIndex) => {
    const selectedValues = searchFields
      .filter((_, idx) => idx !== currentIndex)
      .map((item) => item.field);

    return searchOptions.filter(
      (option) => !selectedValues.includes(option.value),
    );
  };

  return (
    <Card
      className="filter-card p-2 m-0 mb-3"
      style={{
        fontSize: "12px",
        overflow: "visible", // Ensure dropdown can float outside
      }}
    >
      <style>{`
        .custom-autocomplete-dropdown {
          position: absolute;
          top: 100%;
          left: 10px;
          right: 10px;
          z-index: 1000;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 6px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          max-height: 250px;
          overflow-y: auto;
          padding: 4px 0;
          margin: 4px 0 0 0;
          list-style: none;
        }
        .custom-autocomplete-dropdown li {
          padding: 8px 12px;
          cursor: pointer;
          font-size: 13px;
          color: #333;
          transition: background-color 0.2s ease;
        }
        .custom-autocomplete-dropdown li:hover {
          background-color: #f1f3f5;
          color: #000;
        }
        /* Custom scrollbar for dropdown */
        .custom-autocomplete-dropdown::-webkit-scrollbar {
          width: 6px;
        }
        .custom-autocomplete-dropdown::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 4px;
        }
      `}</style>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(e);
        }}
      >
        {/* --- Keyword Search Row --- */}
        {searchFields.map((item, index) => (
          <Row key={index} className="filter-row align-items-center g-2 mb-1">
            <Col xs={12} sm={5} md={4} className="mb-1">
           <Form.Select
  name="field"
  value={item.field}
  onChange={(e) => handleFieldChange(index, e)}
  size="sm"
>
  {getAvailableOptions(index).map((opt) => (
    <option key={opt.value} value={opt.value}>
      {opt.label}
    </option>
  ))}
</Form.Select>
            </Col>

            <Col xs={12} sm={5} md={6} className="mb-1" style={{ position: "relative" }}>
              <Form.Control
                type="text"
                name="keyword"
                id="keyword"
                placeholder="Enter Keyword"
                value={item.keyword}
                onChange={(e) => handleFieldChange(index, e)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setTimeout(() => setFocusedIndex(null), 200)}
                size="sm"
                autoComplete="off"
                style={{
                  fontSize: "12px",
                  height: "30px",
                  padding: "2px 8px",
                }}
              />
              {focusedIndex === index && suggestions && suggestions.length > 0 && item.keyword.length > 0 && (
                (() => {
                  const processedSuggestions = getProcessedSuggestions(item.keyword, suggestions);
                  if (processedSuggestions.length === 0) return null;
                  
                  return (
                    <ul className="custom-autocomplete-dropdown">
                      {processedSuggestions.map((suggestion, i) => (
                        <li
                          key={i}
                          onClick={() => {
                            if (onSuggestionClick) onSuggestionClick(index, suggestion);
                            setFocusedIndex(null);
                          }}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  );
                })()
              )}
            </Col>

            <Col xs="auto">
              <Button
                variant="success"
                onClick={addField}
                size="sm"
                disabled={searchFields.length >= searchOptions.length}
              >
                <FaPlus size={10} />
              </Button>

              {searchFields.length > 1 && (
                <Button
                  variant="danger"
                  onClick={() => removeField(index)}
                  size="sm"
                  className="ms-1"
                >
                  <FaTimes size={10} />
                </Button>
              )}
            </Col>
          </Row>
        ))}

{/* --- Company & Branch Filter Row --- */}
<Row className="filter-row align-items-end g-2 mb-1">
  <Col xs={12} sm={6} md={4} className="mb-1">
    <Form.Label
      style={{
        fontSize: "11px",
        marginBottom: "2px",
      }}
    >
      Company
    </Form.Label>

    <Form.Select
      size="sm"
      value={selectedCompany}
      onChange={(e) => onCompanyChange?.(e.target.value)}
      style={{
        fontSize: "12px",
        height: "30px",
        padding: "2px 8px",
      }}
    >
      <option value="">All Companies</option>

      {companies.map((company) => (
        <option
          key={company.id}
          value={company.id}
        >
          {company.company_name}
        </option>
      ))}
    </Form.Select>
  </Col>

  <Col xs={12} sm={6} md={4} className="mb-1">
    <Form.Label
      style={{
        fontSize: "11px",
        marginBottom: "2px",
      }}
    >
      Branch
    </Form.Label>

    <Form.Select
      size="sm"
      value={selectedBranch}
      onChange={(e) => onBranchChange?.(e.target.value)}
      disabled={!selectedCompany}
      style={{
        fontSize: "12px",
        height: "30px",
        padding: "2px 8px",
      }}
    >
      <option value="">All Branches</option>

      {branches.map((branch) => (
        <option
          key={branch.id}
          value={branch.id}
        >
          {branch.branch_name}
        </option>
      ))}
    </Form.Select>
  </Col>
</Row>
        {/* --- Date Filter Row --- */}
        {filterMode === "date" && (
          <Row className="filter-row align-items-end g-2 mb-1">
            <Col xs={12} sm={6} md={4} className="mb-1">
              <Form.Label
                style={{
                  fontSize: "11px",
                  marginBottom: "2px",
                }}
              >
                Date Filter
              </Form.Label>

              <Form.Select
                size="sm"
                style={{
                  fontSize: "12px",
                  height: "30px",
                  padding: "2px 8px",
                }}
              >
                <option>Created On</option>
              </Form.Select>
            </Col>

            <Col xs={12} sm={6} md={4} className="mb-1">
              <Form.Label
                style={{
                  fontSize: "11px",
                  marginBottom: "2px",
                }}
              >
                From
              </Form.Label>

              <Form.Control
                type="date"
                value={dateFilter.from}
                onChange={(e) =>
                  setDateFilter({
                    ...dateFilter,
                    from: e.target.value,
                  })
                }
                size="sm"
                style={{
                  fontSize: "12px",
                  height: "30px",
                  padding: "2px 8px",
                }}
              />
            </Col>

            <Col xs={12} sm={6} md={4} className="mb-1">
              <Form.Label
                style={{
                  fontSize: "11px",
                  marginBottom: "2px",
                }}
              >
                To
              </Form.Label>

              <Form.Control
                type="date"
                value={dateFilter.to}
                onChange={(e) =>
                  setDateFilter({
                    ...dateFilter,
                    to: e.target.value,
                  })
                }
                size="sm"
                style={{
                  fontSize: "12px",
                  height: "30px",
                  padding: "2px 8px",
                }}
              />
            </Col>
          </Row>
        )}

        {/* --- Buttons --- */}
        <Row className="form-actions g-1 mt-1 d-flex justify-content-end">
          <Col xs="auto">
            <Button
              type="submit"
              variant="warning"
              size="sm"
              style={{
                fontSize: "12px",
                height: "30px",
                padding: "2px 10px",
              }}
            >
              Search
            </Button>
          </Col>

          <Col xs="auto">
            <Button
              variant="danger"
              size="sm"
              onClick={onReset}
              style={{
                fontSize: "12px",
                height: "30px",
                padding: "2px 10px",
              }}
            >
              Reset
            </Button>
          </Col>

          {showDownload && (
            <Col xs="auto">
              <Button
                variant="success"
                size="sm"
                onClick={onDownloadExcel}
                style={{
                  fontSize: "12px",
                  height: "30px",
                  padding: "2px 10px",
                }}
              >
                Download Excel
              </Button>
            </Col>
          )}
        </Row>
      </Form>
    </Card>
  );
};

export default FilterPanel;
