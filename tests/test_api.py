import unittest
from server import create_app


class ApiTest(unittest.TestCase):
    def setUp(self):
        self.client = create_app().test_client()

    def test_dashboard_and_region(self):
        result = self.client.get('/api/dashboard?region=남해군').get_json()
        self.assertEqual(result['temperature'], 26.5)
        self.assertEqual(result['risk']['level'], '관심')
        self.assertTrue(result['demo'])

    def test_temperature_validation_and_boundaries(self):
        for temperature, expected in [(26.9, '관심'), (27, '주의'), (28.9, '주의'), (29, '경계')]:
            result = self.client.get(f'/api/dashboard?temperature={temperature}').get_json()
            self.assertEqual(result['risk']['level'], expected)
        for invalid in ['nan', 'inf', '-1', '41', 'abc']:
            self.assertEqual(self.client.get(f'/api/dashboard?temperature={invalid}').status_code, 400)
        self.assertEqual(self.client.get('/api/dashboard?region=잘못된지역').status_code, 400)

    def test_consultation_requires_valid_farm_and_is_demo(self):
        for invalid in [{}, [], {'region': '없는지역'}]:
            self.assertEqual(self.client.post('/api/consultations', json=invalid).status_code, 400)
        result = self.client.post('/api/consultations', json={'region': '통영시', 'species': '조피볼락 (우럭)'})
        self.assertEqual(result.status_code, 201)
        self.assertEqual(result.get_json()['status'], 'demo_received')

    def test_frontend_and_no_secrets_served(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        response.close()
        for path in ['/.env', '/server.py', '/api/not-found']:
            self.assertEqual(self.client.get(path).status_code, 404)


if __name__ == '__main__':
    unittest.main()
