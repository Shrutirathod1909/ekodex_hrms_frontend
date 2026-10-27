import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Table,
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaPlus, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import Select from "react-select"; // Import react-select
const API_URL = import.meta.env.VITE_API_URL;
const CreateBill = () => {
  const { autoNo } = useParams();

const isEditMode = Boolean(autoNo);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceMonth, setInvoiceMonth] = useState(null);
  const currentYear = new Date().getFullYear();

const [deletedRows, setDeletedRows] = useState([]);


  const yearOptions = [];
  const [invoiceYear, setInvoiceYear] = useState({
    value: String(currentYear),
    label: String(currentYear),
  });
  const [billTitle, setBillTitle] = useState("");

  const navigate = useNavigate();
const [rows, setRows] = useState([
  {
    id:null,
    employeeId:null,
    emp_name:"",
    emp_code:"",
    sac_code:"",
    qty:"",
    rate:"",
    netAmount:0
  }
]);

  // Add current and past 7 years
  for (let i = 0; i <= 7; i++) {
    const year = currentYear - i;
    yearOptions.push({ value: String(year), label: String(year) });
  }

  // Optionally: Add more historical years if needed (e.g., down to 2010)
  for (let year = currentYear - 8; year >= 2010; year--) {
    yearOptions.push({ value: String(year), label: String(year) });
  }

  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
const [editLoading, setEditLoading] = useState(false);
  // Fetch Clients on load
  useEffect(() => {
    axios
      .get(`${API_URL}/api/clients/dropdown`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setClients(res.data.data || []));
  }, []);

  // When Client changes, fetch Sites
useEffect(() => {

  if(selectedClient){

    axios
    .get(
      `${API_URL}/api/clients/sites-dropdown?client_id=${selectedClient.value}`,
      {
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      }
    )
    .then((res)=>{

      setSites(res.data.data || []);

      // फक्त create mode मध्ये reset करा
      if(!editLoading){
        setSelectedSite(null);
      }

    });

  }

},[selectedClient]);
useEffect(()=>{

if(!autoNo) return;


const getBillDetails = async()=>{
  try{
  setEditLoading(true);

const token = localStorage.getItem("token");


const res = await axios.get(
`${API_URL}/api/billing/get-bill/${autoNo}`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);


const bill=res.data.data;
console.log("EDIT BILL DATA:", bill);

setInvoiceNo(bill.invoice_no || "");


setInvoiceDate(
bill.invoice_date
?
bill.invoice_date.substring(0,10)
:
""
);


setBillTitle(bill.bill_title || "");


setSelectedClient({
value:String(bill.client_id),
label:bill.company_name
});


// SITE LOAD

const siteRes = await axios.get(

`${API_URL}/api/clients/sites-dropdown?client_id=${bill.client_id}`,

{
headers:{
Authorization:`Bearer ${token}`
}
}

);


setSites(siteRes.data.data || []);


setSelectedSite({
value:String(bill.site_id),
label:bill.site_name
});



// MONTH

setInvoiceMonth(
{
value:String(bill.invoice_month),
label:
monthOptions[
Number(bill.invoice_month)-1
].label
}
);


// YEAR

setInvoiceYear(
{
value:String(bill.invoice_year),
label:String(bill.invoice_year)
}
);



// EMPLOYEE LOAD

const empRes = await axios.get(

`${API_URL}/api/clients/employee-dropdown?site_id=${bill.site_id}&client_id=${bill.client_id}`,

{
headers:{
Authorization:`Bearer ${token}`
}
}

);


const empList=empRes.data.data || [];


setEmployees(empList);



// ROW DATA


const editRows = bill.items.map(item => ({
    id: item.id,
    employeeId: item.employee_id,   
    emp_name: item.emp_name || item.type || "",
    emp_code: item.emp_code || "",
    sac_code: item.sac_code || "",
    qty: String(item.total_nos || ""),
    rate: String(item.cost_per_head || ""),
    netAmount: String(item.total || 0)
}));


setRows(editRows);



}

catch(error){

console.log(
"EDIT BILL ERROR",
error.response?.data || error
);

}
finally{
 setEditLoading(false);
}

};


getBillDetails();


},[autoNo]);
  // When Site changes, fetch Employees
  useEffect(() => {
    if (selectedSite) {
      axios
        .get(
          `${API_URL}/api/clients/employee-dropdown?site_id=${selectedSite.value}&client_id=${selectedClient.value}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )
        .then((res) => setEmployees(res.data.data || []));
      setSelectedEmployee(null); // Reset
    }
  }, [selectedSite]);

  const siteOptions = [{ value: "4", label: "Mbp-4" }];

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

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      [field]: value,
    };

    // Calculate Net Amount: qty * rate
    const qty = parseFloat(newRows[index].qty) || 0;
    const rate = parseFloat(newRows[index].rate) || 0;
    newRows[index].netAmount = (qty * rate).toFixed(2);

    setRows(newRows);
  };

const addRow = () => {

 setRows([
   ...rows,
   {
     id:null,
     employeeId:null,
     emp_name:"",
     emp_code:"",
     sac_code:"",
     qty:"",
     rate:"",
     netAmount:0
   }
 ]);

};
const removeRow = (index) => {

  const row = rows[index];

  console.log("REMOVED ROW:", row);

  if (row.id) {

    setDeletedRows((prev) => {

      const updatedRows = [...prev, row.id];

      console.log("DELETED ROW IDS:", updatedRows);

      return updatedRows;

    });

  }

  setRows((prev) => prev.filter((_, i) => i !== index));

};

  const getAvailableEmployees = (currentRowEmployeeId) => {
    const selectedIds = rows
      .map((row) => row.employeeId)
      .filter((id) => id !== null && id !== currentRowEmployeeId);

    return employees.filter((emp) => !selectedIds.includes(emp.id.toString()));
  };

const handleEmployeeChange = (index, selectedOption) => {

const newRows=[...rows];


if(!selectedOption){

newRows[index]={
...newRows[index],
employeeId:null,
rate:0,
netAmount:0
};

setRows(newRows);
return;

}


const emp = employees.find(
(e)=>e.id.toString()===selectedOption.value
);


newRows[index]={
...newRows[index],
employeeId:selectedOption.value,
rate:emp?.emp_perday_rate || 0,
netAmount:(
Number(newRows[index].qty || 0) *
Number(emp?.emp_perday_rate || 0)
).toFixed(2)
};


setRows(newRows);

};

const generateBill = async () => {

  try {

    const token = localStorage.getItem("token");


    console.log("TOKEN:", token);


    if(!token){

      alert("Token not found. Please login again.");
      return;

    }


const payload = {
  autoNo: autoNo,

  client_id: selectedClient?.value,

  site_id: selectedSite?.value,

  invoice_no: invoiceNo,

  invoice_date: invoiceDate,

  invoice_month: invoiceMonth?.value,

  invoice_year: invoiceYear?.value,

  bill_title: billTitle,

  deletedRows, // <-- Add this

items: rows
  .filter(row =>
    row.id ||
    row.employeeId ||
    row.emp_name ||
    row.sac_code ||
    row.qty ||
    row.rate
  )
    .map(row => {

      const emp = employees.find(
        e => e.id.toString() === String(row.employeeId)
      );

      return {
        id: row.id,

        employee_id: row.employeeId,

        type: emp?.emp_full_name || row.emp_name,

        rank: emp?.rank || "",

        emp_code: emp?.employee_code || row.emp_code || "",

        sac_code: row.sac_code,

        total_nos: row.qty,

        cost_per_head: row.rate,

        total: row.netAmount
      };

    })
};



    console.log("PAYLOAD:",payload);



    const url = isEditMode

    ?

    `${API_URL}/api/billing/update-bill/${autoNo}`

    :

    `${API_URL}/api/billing/generate-bill`;


console.log("========== BILL PAYLOAD START ==========");
console.log(JSON.stringify(payload, null, 2));
console.log("========== BILL PAYLOAD END ==========");


    const response = await axios.post(

      url,

      payload,

      {

        headers:{

          Authorization:`Bearer ${token}`,

          "Content-Type":"application/json"

        }

      }

    );



    console.log("RESPONSE:",response.data);



    if(response.data.success){

      alert(

        isEditMode

        ?

        "Bill Updated Successfully"

        :

        "Bill Generated Successfully"

      );


      navigate(-1);

    }



  }

catch (error) {

  console.error("ERROR:", error);

  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong";

  alert(message);

}

};

  // console.log(employees);
return (
  <Container fluid className="p-0">

    {/* Header */}

    <Row className="align-items-center mb-4">

      <Col>

        <h4 className="fw-bold">
          {isEditMode ? "Edit Bill" : "Create New Bill"}
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
          onClick={generateBill}
        >

          <FaSave className="me-1" />

          {
            isEditMode
              ? "Update Bill"
              : "Generate Bill"
          }

        </Button>


      </Col>

    </Row>



    <Card className="shadow-sm border-0">


      <Card.Body>


        {/* Client Details */}


        <Row className="mb-3">


          <Col md={3}>

            <Form.Label>
              Client/Company
            </Form.Label>


            <Select

              options={
                clients.map((c)=>({

                  value:c.id,

                  label:c.company_name

                }))
              }


              value={selectedClient}


              onChange={(val)=>
                setSelectedClient(val)
              }


              isSearchable

            />


          </Col>




          <Col md={3}>


            <Form.Label>
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


              onChange={(val)=>
                setSelectedSite(val)
              }


              isDisabled={!selectedClient}


              isSearchable

            />


          </Col>




          <Col md={3}>


            <Form.Label>
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


            <Form.Label>
              Invoice No
            </Form.Label>


            <Form.Control

              type="text"

              value={invoiceNo}

              onChange={(e)=>
                setInvoiceNo(e.target.value)
              }

            />


          </Col>


        </Row>





        {/* Invoice Information */}


        <Row className="mb-4">


          <Col md={3}>


            <Form.Label>
              Invoice Month
            </Form.Label>


            <Select

              options={monthOptions}

              value={invoiceMonth}

              onChange={setInvoiceMonth}

              placeholder="Select Month"

            />


          </Col>




          <Col md={3}>


            <Form.Label>
              Invoice Year
            </Form.Label>


            <Select

              options={yearOptions}

              value={invoiceYear}

              onChange={setInvoiceYear}

              placeholder="Select Year"


            />


          </Col>




          <Col md={6}>


            <Form.Label>
              Subtitle
            </Form.Label>


            <Form.Control

              type="text"

              value={billTitle}

              onChange={(e)=>
                setBillTitle(e.target.value)
              }

            />


          </Col>


        </Row>





        {/* Employee Billing Table */}


        <Table
          bordered
          hover
          responsive
        >


          <thead className="table-light">


            <tr>

              <th>
                Sr. No.
              </th>


              <th>
                Item Description
              </th>


              <th>
                HSN / SAC
              </th>


              <th>
                QTY / TON / DAY
              </th>


              <th>
                Rate
              </th>


              <th>
                Net Amount
              </th>


              <th>
                Action
              </th>


            </tr>


          </thead>




          <tbody>


          {rows.map((row,index)=>(


            <tr key={index}>


              <td className="align-middle">
                {index+1}
              </td>


<td>
  <input
    type="text"
    className="form-control"
    placeholder="Item Description"
    value={row.emp_name || ""}
    onChange={(e) =>
      handleRowChange(index, "emp_name", e.target.value)
    }
    autoComplete="off"
    name={`emp_name_${index}`}
  />
</td>





              <td>


                <Form.Control

                  value={
                    row.sac_code || ""
                  }


                  onChange={(e)=>
                    handleRowChange(
                      index,
                      "sac_code",
                      e.target.value
                    )
                  }

                />


              </td>





              <td>


                <Form.Control

                  type="number"

                  value={row.qty}


                  onChange={(e)=>
                    handleRowChange(
                      index,
                      "qty",
                      e.target.value
                    )
                  }

                />


              </td>





              <td>


                <Form.Control

                  type="number"

                  value={row.rate}


                  onChange={(e)=>
                    handleRowChange(
                      index,
                      "rate",
                      e.target.value
                    )
                  }

                />


              </td>





              <td>


                <Form.Control

                  value={row.netAmount}

                  disabled

                />


              </td>





              <td>


                <Button

                  variant="danger"

                  size="sm"

                  onClick={()=>
                    removeRow(index)
                  }

                >

                  <FaTrash/>

                </Button>


              </td>



            </tr>


          ))}


          </tbody>


        </Table>





        <Button

          variant="link"

          className="text-decoration-none"

          onClick={addRow}

        >

          <FaPlus className="me-2"/>

          Add New Row

        </Button>



      </Card.Body>


    </Card>


  </Container>
);
};

export default CreateBill;
