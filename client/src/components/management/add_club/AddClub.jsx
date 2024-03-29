import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';

function AddClub({ updateClubs }) { // รับฟังก์ชัน updateClubs ผ่าน props
  const [formData, setFormData] = useState({
    club_name: '',
    open_to_receive: '',
    number_of_member: '',
    end_date_of_receive: '',
    teacher_id: [],
    class_id: []
  });
  const [classList, setClassList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [loggedInTeacherId, setLoggedInTeacherId] = useState(null);

  useEffect(() => {
    fetchClassList();
    fetchTeacherList();

    const teacherSession = localStorage.getItem('@teacher');
    if (teacherSession) {
      const { id } = JSON.parse(teacherSession);
      setLoggedInTeacherId(id);
      setFormData(prevData => ({
        ...prevData,
        teacher_id: [id]
      }));
    }
  }, []);

  const fetchClassList = async () => {
    try {
      const response = await fetch('http://localhost:4000/class_list');
      if (response.ok) {
        const data = await response.json();
        const options = data.map(classItem => ({
          value: classItem.class_id,
          label: classItem.class_name
        }));
        setClassList(options);
      } else {
        console.error('Failed to fetch class list:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching class list:', error);
    }
  };

  const fetchTeacherList = async () => {
    try {
      const response = await fetch('http://localhost:4000/teacher_list');
      if (response.ok) {
        const data = await response.json();
        const filteredTeacherList = data.filter(teacher => {
          const teacherSession = localStorage.getItem('@teacher');
          if (teacherSession) {
            const { id } = JSON.parse(teacherSession);
            return teacher.teacher_id !== id;
          }
          return true;
        });
        const options = filteredTeacherList.map(teacher => ({
          value: teacher.teacher_id,
          label: `${teacher.first_name} ${teacher.last_name}`
        }));
        setTeacherList(options);
      } else {
        console.error('Failed to fetch teacher list:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching teacher list:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSelectChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(option => option.value);
    setFormData(prevData => ({
      ...prevData,
      class_id: selectedValues
    }));
  };

  const handleSelectChangeTeacher = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prevData => ({
      ...prevData,
      teacher_id: selectedValues
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = { ...formData };
      formDataToSend.teacher_id.push(loggedInTeacherId);
      const response = await fetch('http://localhost:4000/create_club', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend)
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Club created successfully:', data);
  
        // เมื่อสร้างชุมนุมสำเร็จ ให้เรียกใช้ฟังก์ชัน updateClubs เพื่ออัปเดตข้อมูลใน MyClub
        updateClubs();
  
        // รีเฟรชฟอร์มโดยล้างข้อมูลในฟอร์ม
        setFormData({
          club_name: '',
          open_to_receive: '',
          number_of_member: '',
          end_date_of_receive: '',
          teacher_id: [],
          class_id: []
        });
      } else {
        console.error('Failed to create club:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating club:', error);
    }
  };
  

  return (
    <div className="container px-5">
      <h2>สร้างชุมนุมใหม่</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ชื่อชุมนุม</label>
          <input type="text" className="form-control" name="club_name" value={formData.club_name} onChange={handleInputChange} required />
        </div>
        <div className="form-group mt-2">
          <label>จำนวนที่รับ</label>
          <input type="number" className="form-control" name="open_to_receive" value={formData.open_to_receive} onChange={handleInputChange} required />
        </div>
        <div className="form-group mt-2">
          <label>วันที่ปิดรับ</label>
          <input type="date" className="form-control" name="end_date_of_receive" value={formData.end_date_of_receive} onChange={handleInputChange} required />
        </div>
        <div className="form-group mt-2">
          <label>เลือกครูที่ปรึกษาชุมนุม</label>
          <Select
            options={teacherList}
            isMulti
            onChange={handleSelectChangeTeacher}
            value={teacherList.filter(option => formData.teacher_id.includes(option.value))}
          />
        </div>
        <div className="form-group mt-2">
          <label>ชั้นที่เลือกได้</label>
          <Select
            options={classList}
            isMulti
            onChange={handleSelectChange}
            value={classList.filter(option => formData.class_id.includes(option.value))}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">สร้างชุมนุม</button>
      </form>
    </div>
  );
}

export default AddClub;
