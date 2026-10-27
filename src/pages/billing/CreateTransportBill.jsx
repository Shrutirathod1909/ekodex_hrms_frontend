import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card,
} from "react-bootstrap";
import { FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const CreateTransportBill = () => {
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [billTitle, setBillTitle] = useState("");
const [deletedRows, setDeletedRows] = useState([]);
  const currentYear = new Date().getFullYear();


const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];


const yearOptions = [];

for (let i = 0; i <= 7; i++) {
  yearOptions.push({
    value: String(currentYear - i),
    label: String(currentYear - i),
  });
}
  const [invoiceMonth, setInvoiceMonth] = useState({
    value: String(new Date().getMonth() + 1),
    label: new Date().toLocaleString("default", { month: "long" }),
  });

  const [invoiceYear, setInvoiceYear] = useState({
    value: String(currentYear),
    label: String(currentYear),
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const { autoNo } = useParams();
  const [editMode,setEditMode] = useState(false);
  // Start with 5 rows
  const [rows, setRows] = useState(
    Array.from({ length: 5 }, () => ({
      date: "",
      hsn: "",
      from: "",
      to: "",
      lrNo: "",
      vehicleNo: "",
      weight: "",
      invoiceNo: "",
      netAmount: "",
    })),
  );

  const addRow = () => {
    setRows([
      ...rows,
      {
        date: "",
        hsn: "",
        from: "",
        to: "",
        lrNo: "",
        vehicleNo: "",
        weight: "",
        invoiceNo: "",
        netAmount: "",
      },
    ]);
  };

 const removeRow = (index) => {

  const row = rows[index];

  console.log("TRANSPORT REMOVED ROW:", row);


  // Edit mode existing row
  if(row.id){

    setDeletedRows((prev)=>{

      const updated = [
        ...prev,
        row.id
      ];

      console.log(
        "TRANSPORT DELETED IDS:",
        updated
      );

      return updated;

    });

  }


  if(rows.length > 1){

    setRows(
      rows.filter((_,i)=>i!==index)
    );

  }

};

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

 

  useEffect(() => {
    axios
      .get(`${API_URL}/api/clients/dropdown`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setClients(res.data.data || []))
      .catch(console.error);
  }, []);
useEffect(() => {
  if(!autoNo) return;

  setEditMode(true);

  axios.get(
 `${API_URL}/api/billing/get-transport-bill/${autoNo}`,
    {
      headers:{
        Authorization:`Bearer ${localStorage.getItem("token")}`
      }
    }
  )
  .then((res)=>{

    const bill = res.data.data;

    setInvoiceNo(bill.invoice_no);
    setInvoiceDate(
      bill.invoice_date?.split("T")[0]
    );

    setBillTitle(bill.bill_title);


    setInvoiceMonth({
      value:String(bill.invoice_month),
      label:monthOptions.find(
        x=>x.value==bill.invoice_month
      )?.label
    });


    setInvoiceYear({
      value:String(bill.invoice_year),
      label:String(bill.invoice_year)
    });


setSelectedClient({
  value: bill.client_id,
  label: bill.company_name
});


axios.get(
 `${API_URL}/api/clients/sites-dropdown?client_id=${bill.client_id}`,
 {
  headers:{
   Authorization:`Bearer ${localStorage.getItem("token")}`
  }
 }
)
.then((siteRes)=>{

 setSites(siteRes.data.data || []);

 setSelectedSite({
   value: bill.site_id,
   label: bill.site_name
 });

});


setRows(
  bill.items.map(item=>({
        id:item.id, 
    date:item.date?.split("T")[0] || "",
    hsn:item.hsn || "",
    from:item.from || "",
    to:item.to || "",
    lrNo:item.lrNo || "",
    vehicleNo:item.vehicleNo || "",
    weight:item.weight || "",
    invoiceNo:item.invoiceNo || "",
    netAmount:item.netAmount || ""
  }))
);


  })
  .catch(err=>{
    console.log(err);
    alert("Failed to load bill");
  });


},[autoNo]);
  useEffect(() => {
    if (!selectedClient) return;

    axios
      .get(
        `${API_URL}/api/clients/sites-dropdown?client_id=${selectedClient.value}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      .then((res) => setSites(res.data.data || []))
      .catch(console.error);
  }, [selectedClient]);

  // console.log("setSites", sites);
const handleGenerateBill = async () => {
  try {
    setLoading(true);

    const payload = {
      client_id: selectedClient?.value,
      site_id: selectedSite?.value,
      invoice_no: invoiceNo,
      invoice_date: invoiceDate,
      invoice_month: invoiceMonth?.value,
      invoice_year: invoiceYear?.value,
      bill_title: billTitle,
  deletedRows,
      items: rows
        .filter(
          (r) =>
            r.hsn ||
            r.from ||
            r.to ||
            r.vehicleNo ||
            r.netAmount
        )
        .map((r) => ({
            id:r.id,
          date: r.date,
          hsn: r.hsn,
          from: r.from,
          to: r.to,
          lrNo: r.lrNo,
          vehicleNo: r.vehicleNo,
          weight: r.weight,
          invoiceNo: r.invoiceNo,
          netAmount: r.netAmount,
        })),
    };


    // New Bill / Edit Bill API
    const url = editMode
 ? `${API_URL}/api/billing/update-transport-bill/${autoNo}`
      : `${API_URL}/api/billing/generate-transport-bill`;


    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );


    alert(response.data.message);
   navigate(-1);


  } catch (error) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to save bill"
    );


  } finally {

    setLoading(false);

  }
};

return (
  <Container fluid className="p-0">


    {/* Header Section */}

    <Row className="align-items-center mb-4">

      <Col>

        <h4 className="fw-bold">
          Create Transport Bill
        </h4>

      </Col>


      <Col className="text-end">


        <Button
          variant="secondary"
          className="me-2"
          onClick={() => navigate(-1)}
        >

          <FaTimes className="me-1" />

          Cancel

        </Button>



        <Button
          variant="primary"
          className="px-4"
          onClick={handleGenerateBill}
          disabled={loading}
        >

          <FaSave className="me-2" />

          {
            editMode
              ? "Update Bill"
              : "Generate New Bill"
          }

        </Button>


      </Col>


    </Row>




    {/* Form Card */}


    <Card
      className="shadow-sm border-0 mb-4"
    >

      <Card.Body>


        <Row className="g-3">


          <Col md={3}>

            <Form.Label className="fw-semibold text-muted">

              Client / Company

            </Form.Label>


            <Select

              options={
                clients.map((c)=>({

                  value:c.id,

                  label:c.company_name

                }))
              }


              value={selectedClient}


              onChange={setSelectedClient}


              isSearchable

            />


          </Col>




          <Col md={3}>


            <Form.Label className="fw-semibold text-muted">

              Select Site

            </Form.Label>



            <Select

              options={
                sites.map((s)=>({

                  value:s.id,

                  label:s.site_name

                }))
              }


              value={selectedSite}


              onChange={setSelectedSite}


              isDisabled={!selectedClient}


              isSearchable

            />


          </Col>




          <Col md={3}>


            <Form.Label className="fw-semibold text-muted">

              Invoice Date

            </Form.Label>


            <Form.Control

              type="date"

              value={invoiceDate}

              onChange={(e)=>
                setInvoiceDate(e.target.value)
              }

            />


          </Col>




          <Col md={3}>


            <Form.Label className="fw-semibold text-muted">

              Invoice No

            </Form.Label>


            <Form.Control

              type="text"

              value={invoiceNo}

              onChange={(e)=>
                setInvoiceNo(e.target.value)
              }


              placeholder="INV-001"

            />


          </Col>





          <Col md={3}>


            <Form.Label className="fw-semibold text-muted">

              Invoice Month

            </Form.Label>


            <Select

              options={monthOptions}

              value={invoiceMonth}

              onChange={setInvoiceMonth}

              isSearchable

            />


          </Col>





          <Col md={3}>


            <Form.Label className="fw-semibold text-muted">

              Invoice Year

            </Form.Label>


            <Select

              options={yearOptions}

              value={invoiceYear}

              onChange={setInvoiceYear}

              isSearchable

            />


          </Col>





          <Col md={6}>


            <Form.Label className="fw-semibold text-muted">

              Subtitle

            </Form.Label>


            <Form.Control

              type="text"

              value={billTitle}

              onChange={(e)=>
                setBillTitle(e.target.value)
              }

              placeholder="Enter subtitle"

            />


          </Col>



        </Row>


      </Card.Body>


    </Card>





    {/* Transport Details Table */}


    <Card
      className="shadow-sm border-0"
    >

      <Card.Body className="p-0">


        <Table
          hover
          responsive
          className="mb-0"
        >


          <thead className="table-light">


            <tr>


              <th className="text-center">
                S.No
              </th>


              {
                [
                  "Date",
                  "HSN",
                  "From",
                  "To",
                  "LR No",
                  "Vehicle No",
                  "Weight",
                  "Invoice No",
                  "Net Amount",
                  "Action"

                ].map((h)=>(


                  <th key={h}>
                    {h}
                  </th>


                ))
              }


            </tr>


          </thead>



          <tbody>



          {
            rows.map((row,index)=>(


              <tr key={index}>


                <td className="text-center fw-bold">

                  {index+1}

                </td>




                {
                  Object.keys(row)

                  .filter(
                    field =>
                    field !== "id"
                  )

                  .map(field=>(


                    <td key={field}>


                      <Form.Control


                        size="sm"


                        type={
                          field==="date"
                          ?
                          "date"
                          :
                          "text"
                        }


                        value={
                          row[field] || ""
                        }


                        onChange={(e)=>
                          handleInputChange(
                            index,
                            field,
                            e.target.value
                          )
                        }


                      />


                    </td>


                  ))
                }




                <td className="text-center">


                  <Button

                    variant="link"

                    className="text-danger"

                    onClick={()=>
                      removeRow(index)
                    }

                  >

                    <FaTrash/>

                  </Button>


                </td>



              </tr>


            ))
          }



          </tbody>


        </Table>



        <div className="p-3 border-top">


          <Button

            variant="outline-primary"

            size="sm"

            onClick={addRow}

          >

            <FaPlus className="me-2"/>

            Add More Row


          </Button>


        </div>


      </Card.Body>


    </Card>


  </Container>
);
};

export default CreateTransportBill;
