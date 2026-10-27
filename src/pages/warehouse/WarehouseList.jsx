import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Dropdown,
  Badge,
} from "react-bootstrap";

import {
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaWarehouse,
} from "react-icons/fa";

import {
  useNavigate,
} from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const WarehouseList = () => {

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [warehouseList, setWarehouseList] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const token =
    localStorage.getItem("token");

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchWarehouses = async () => {

    try {

      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/warehouse`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWarehouseList(response.data || []);

    } catch (error) {

      console.error(
        "Warehouse Fetch Error",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // ===============================
  // DELETE
  // ===============================
// ===============================
// DELETE WAREHOUSE
// ===============================
const handleDelete = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure want to delete this warehouse?"
  );

  if (!confirmDelete) return;

  try {

    await axios.post(
      `${API_URL}/api/warehouse/delete/${id}`,
      {}, // BODY

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Warehouse Deleted Successfully");

    fetchWarehouses();

  } catch (error) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Delete Failed"
    );
  }
};

  // ===============================
  // FILTER DATA
  // ===============================
  const filteredData =
    warehouseList.filter((item) => {

      const searchText =
        search.toLowerCase();

      return (

        item.client_name
          ?.toLowerCase()
          .includes(searchText) ||

        item.client_code
          ?.toLowerCase()
          .includes(searchText) ||

        item.warehouse_name
          ?.toLowerCase()
          .includes(searchText) ||

        item.city
          ?.toLowerCase()
          .includes(searchText) ||

        item.gst_no
          ?.toLowerCase()
          .includes(searchText)

      );
    });

  return (

    <div className="container-fluid py-3">
<Card className="shadow-sm border-0 rounded-3">

  {/* HEADER */}
  <Card.Header
    className="
      bg-primary
      text-white
      rounded-top-3
      py-2
      px-3
    "
  >

    <Row className="align-items-center g-2">

      {/* TITLE */}
      <Col md={3}>

        <h6 className="mb-0 fw-bold">
          Warehouse List
        </h6>

      </Col>

      {/* SEARCH */}
      <Col md={5}>

        <InputGroup size="sm">

          <InputGroup.Text>
            <FaSearch size={12} />
          </InputGroup.Text>

          <Form.Control
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </InputGroup>

      </Col>

      {/* BUTTONS */}
      <Col
        md={4}
        className="
          text-md-end
          mt-2
          mt-md-0
        "
      >

        <Button
          size="sm"
          variant="light"
          className="me-2"
          onClick={fetchWarehouses}
        >
          <FaSyncAlt size={11} className="me-1" />
          Refresh
        </Button>

        <Button
          size="sm"
          variant="warning"
          onClick={() =>
            navigate("/warehouse-form")
          }
        >
          <FaPlus size={11} className="me-1" />
          Add
        </Button>

      </Col>

    </Row>

  </Card.Header>

  {/* TABLE */}
  <Card.Body className="p-0">

    <div className="table-responsive">

      <Table
        hover
        bordered
        size="sm"
        className="
          mb-0
          align-middle
          small
        "
      >

        <thead className="table-dark text-center">

          <tr>

            <th style={{ width: "50px" }}>
              #
            </th>

            <th>
              Client
            </th>

            <th>
              Warehouse
            </th>

            <th>
              Contact
            </th>

            <th>
              Location
            </th>

            <th>
              GST
            </th>

            <th>
              Created
            </th>

            <th style={{ width: "60px" }}>
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {filteredData.length > 0 ? (

            filteredData.map(
              (item, index) => (

                <tr key={item.id}>

                  {/* SR */}
                  <td className="text-center fw-bold">
                    {index + 1}
                  </td>

                  {/* CLIENT */}
                  <td>

                    <div
                      className="
                        fw-semibold
                        text-primary
                      "
                      style={{
                        fontSize: "13px",
                      }}
                    >
                      {item.client_name}
                    </div>

                    <small className="text-muted">
                      {item.client_code}
                    </small>

                  </td>

                  {/* WAREHOUSE */}
                  <td>

                    <span
                      className="fw-semibold"
                      style={{
                        fontSize: "13px",
                      }}
                    >
                      {item.warehouse_name}
                    </span>

                  </td>

                  {/* CONTACT */}
                  <td>

                    <div
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      {item.contact_person || "-"}
                    </div>

                    <small className="text-muted">
                      {item.mobile_no || "-"}
                    </small>

                  </td>

                  {/* LOCATION */}
                  <td>

                    <div
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      {item.city || "-"}
                    </div>

                    <small className="text-muted">
                      {item.state_name || "-"}
                    </small>

                    <br />

                    <small className="text-success">
                      {item.pincode || "-"}
                    </small>

                  </td>

                  {/* GST */}
                  <td>

                    <small>
                      {item.gst_no || "-"}
                    </small>

                  </td>

                  {/* CREATED */}
                  <td>

                    <div
                      className="fw-semibold"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      {item.created_by_name || "-"}
                    </div>

                    <small className="text-muted">

                      {item.created_on
                        ? new Date(
                            item.created_on
                          ).toLocaleDateString()
                        : "-"}

                    </small>

                  </td>

                  {/* ACTION */}
                  <td className="text-center">

                    <Dropdown>

                      <Dropdown.Toggle
                        size="sm"
                        variant="light"
                        className="
                          border-0
                          shadow-none
                          p-1
                        "
                      >
                        <FaEllipsisV size={12} />
                      </Dropdown.Toggle>

                      <Dropdown.Menu>

                        {/* EDIT */}
                        <Dropdown.Item
                          onClick={() =>
                            navigate(
                              `/warehouse-form/${item.id}`
                            )
                          }
                        >
                          <FaEdit className="me-2 text-primary" />
                          Edit
                        </Dropdown.Item>

                        {/* DELETE */}
                        <Dropdown.Item
                          className="text-danger"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                        >
                          <FaTrash className="me-2" />
                          Delete
                        </Dropdown.Item>

                      </Dropdown.Menu>

                    </Dropdown>

                  </td>

                </tr>
              )
            )

          ) : (

            <tr>

              <td
                colSpan="8"
                className="
                  text-center
                  py-3
                "
              >

                {loading
                  ? "Loading..."
                  : "No Data Found"}

              </td>

            </tr>
          )}

        </tbody>

      </Table>

    </div>

  </Card.Body>

</Card>

    </div>
  );
};

export default WarehouseList;