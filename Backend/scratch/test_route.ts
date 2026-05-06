import axios from 'axios';

async function testRoute() {
    try {
        const resp = await axios.post('http://localhost:8000/api/compare/find', {
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

testRoute();
