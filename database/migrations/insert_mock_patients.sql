-- Script to insert mock patient data
-- Run this after creating the table and getting your clinic_id

-- First, get your clinic_id (replace with actual query result)
-- SELECT id FROM clinics WHERE owner_id = auth.uid();

-- Replace 'YOUR_CLINIC_ID_HERE' with the actual UUID from the query above

INSERT INTO patients (clinic_id, name, whatsapp, cpf, email, health_plan, plan_number, status) VALUES
  ('YOUR_CLINIC_ID_HERE', 'Maria Santos Silva', '+5511987654321', '12345678900', 'maria.santos@email.com', 'Unimed', '1234567890123456', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'João Pedro Oliveira', '+5511976543210', '98765432100', 'joao.pedro@email.com', 'SulAmérica', '9876543210987654', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Ana Paula Costa', '+5511965432109', '45678912300', 'ana.costa@email.com', 'Bradesco Saúde', '4567891234567890', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Carlos Eduardo Souza', '+5511954321098', '78912345600', 'carlos.souza@email.com', 'Amil', '7891234567891234', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Fernanda Lima', '+5511943210987', '32165498700', null, 'Particular', null, 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Roberto Almeida', '+5511932109876', '65498732100', 'roberto.almeida@email.com', 'Porto Seguro', '6549873216549873', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Patricia Rodrigues', '+5511921098765', '98732165400', 'patricia.rodrigues@email.com', 'NotreDame Intermédica', '9873216549873216', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Lucas Martins', '+5511910987654', '14725836900', 'lucas.martins@email.com', 'Golden Cross', '1472583694725836', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Juliana Ferreira', '+5511909876543', '36925814700', null, 'Particular', null, 'inactive'),
  ('YOUR_CLINIC_ID_HERE', 'Ricardo Santos', '+5511898765432', '85274196300', 'ricardo.santos@email.com', 'Unimed', '8527419638527419', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Amanda Silva', '+5511887654321', '74185296300', 'amanda.silva@email.com', 'SulAmérica', '7418529637418529', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Pedro Henrique Costa', '+5511876543210', '96385274100', null, 'Particular', null, 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Camila Oliveira', '+5511865432109', '15935746800', 'camila.oliveira@email.com', 'Bradesco Saúde', '1593574681593574', 'active'),
  ('YOUR_CLINIC_ID_HERE', 'Bruno Carvalho', '+5511854321098', '35795148600', 'bruno.carvalho@email.com', 'Amil', '3579514863579514', 'blocked'),
  ('YOUR_CLINIC_ID_HERE', 'Tatiana Pereira', '+5511843210987', '95175348600', 'tatiana.pereira@email.com', 'Porto Seguro', '9517534869517534', 'active');

-- Verify insertion
SELECT 
  name, 
  whatsapp, 
  health_plan, 
  status,
  created_at
FROM patients
ORDER BY created_at DESC;
