import axios from 'axios';

async function testPythonRoute() {
    try {
        const resp = await axios.post('http://localhost:8001/api/persona/compare', {
            report1_id: 'test',
            report2_id: 'test2'
        });
        console.log('Response:', resp.data);
    } catch (err) {
        if (err.response) {
            console.log('Error Status:', err.response.status);
            console.log('Error Data:', err.response.data);
        } else {
            console.log('Error:', err.message);
        }
    }
}

testPythonRoute();
