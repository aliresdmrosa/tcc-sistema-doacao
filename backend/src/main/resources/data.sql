-- Dados de teste idempotentes para desenvolvimento local.
-- Senhas: admin123, tecnico123, usuario123, doador123, solicitante123 e teste123.

INSERT IGNORE INTO pessoa (id, nome, cpf, email, senha, ativo, data_cadastro) VALUES
-- (1001, 'Administrador Teste', '00000000000', 'admin@sistemadoacao.com', '$2a$10$8pcVZqCE019QcjNj0QbmQuTgX64fCjzwxiPFJzBPcTdAIXq/R/Bje', true, '2025-01-02'),
(1002, 'Tecnico Teste', '02867277060', 'tecnico@sistemadoacao.com', '$2a$10$jO0B/BqMet3aNUBrFXsw8.ubOSm3oNT1Au03lfz.WOR9fiG2zAsG6', true, '2025-01-03'),
(1003, 'Usuario Teste', '26054908073', 'usuario@sistemadoacao.com', '$2a$10$Zs0tNOn8FnySrzulEn3RmuxKzbCzjZMGqPsjJPVOujFvPUUlOPBJu', true, '2025-01-04'),
(1004, 'Ana Paula Doadora', '85746401072', 'ana.doadora@teste.com', '$2a$10$BABWkBKe4WB5uWyzMRnN..QCwor22qPke0M8mDpzLT0A46DUt9/3C', true, '2025-01-05'),
(1005, 'Bruno Lima Doador', '13865162010', 'bruno.doador@teste.com', '$2a$10$BABWkBKe4WB5uWyzMRnN..QCwor22qPke0M8mDpzLT0A46DUt9/3C', true, '2025-01-06'),
(1006, 'Carla Souza Doadora', '58144887000', 'carla.doadora@teste.com', '$2a$10$BABWkBKe4WB5uWyzMRnN..QCwor22qPke0M8mDpzLT0A46DUt9/3C', true, '2025-01-07'),
(1007, 'Diego Martins Aluno', '08483311097', 'diego.aluno@teste.com', '$2a$10$BABWkBKe4WB5uWyzMRnN..QCwor22qPke0M8mDpzLT0A46DUt9/3C', true, '2025-02-01'),
(1008, 'Elisa Rocha Aluna', '65559241016', 'elisa.aluna@teste.com', '$2a$10$BABWkBKe4WB5uWyzMRnN..QCwor22qPke0M8mDpzLT0A46DUt9/3C', true, '2025-03-01');

INSERT  INTO pessoa (id, nome, cpf, email, senha, ativo, data_cadastro) VALUES
(1011, 'Doador Teste', '15390911040', 'doador@sistemadoacao.com', '$2b$10$7A16dwUe49PmNDA/XzoEGeI11tJIkp5pMBbD37tnwvjvRfQa6ijPC', true, '2026-06-25'),
(1010, 'Solicitante Teste', '38743781012', 'solicitante@sistemadoacao.com', '$2b$10$JegIBxNV.U6TFGcIru65HOnZ0/BSzAPwAwP2KXmf5dj8R5nxjGhQ6', true, '2026-06-25');

INSERT IGNORE INTO administrador (id) VALUES (1001);
INSERT IGNORE INTO tecnico (id, grr, curso) VALUES (1002, '20240001', 'TADS');
INSERT IGNORE INTO usuario (id) VALUES (1003), (1004), (1005), (1006), (1007), (1008);

DELETE FROM pessoa_perfil WHERE pessoa_id BETWEEN 1001 AND 1008;

INSERT IGNORE INTO pessoa_perfil (pessoa_id, perfis) VALUES
(1001, 'ADMINISTRADOR'),
(1002, 'TECNICO'),
(1003, 'USUARIO'),
(1004, 'USUARIO'),
(1005, 'USUARIO'),
(1006, 'USUARIO'),
(1007, 'USUARIO'),
(1008, 'USUARIO');

INSERT IGNORE INTO solicitacao
(id, usuario_id, equipamento, curso, grr, motivo, data_cadastro, status, ativo, sem_computador) VALUES
(2001, 1003, 'NOTEBOOK', 'TADS', '20250001', 'Preciso de notebook para acompanhar aulas e desenvolver trabalhos.', '2025-01-08', 'ENTREGUE', true, true),
(2002, 1007, 'COMPUTADOR', 'BCC', '20250002', 'Computador para estudos de programacao e projetos do curso.', '2025-02-06', 'ENTREGUE', true, true),
(2003, 1008, 'MONITOR', 'DESIGN_GRAFICO', '20250003', 'Monitor para atividades de design e edicao.', '2025-03-04', 'ENTREGUE', true, true),
(2004, 1003, 'TECLADO', 'GI', '20250004', 'Teclado para uso em laboratorio e estudo remoto.', '2025-04-09', 'ENTREGUE', true, true),
(2005, 1007, 'MOUSE', 'ENGENHARIA_CIVIL', '20250005', 'Mouse para uso com notebook emprestado.', '2025-05-07', 'ENTREGUE', true, true),
(2006, 1008, 'NOTEBOOK', 'ENGENHARIA_ELETRICA', '20250006', 'Equipamento para simuladores e aulas online.', '2025-06-05', 'ENTREGUE', true, true),
(2007, 1003, 'COMPUTADOR', 'ENGENHARIA_MECANICA', '20250007', 'Computador para softwares academicos.', '2025-07-03', 'ENTREGUE', true, true),
(2008, 1007, 'MONITOR', 'ARQUITETURA_E_URBANISMO', '20250008', 'Monitor para projetos e plantas digitais.', '2025-08-11', 'ENTREGUE', true, true),
(2009, 1008, 'NOTEBOOK', 'TADS', '20250009', 'Notebook para conclusao de semestre.', '2025-09-02', 'ENTREGUE', true, true),
(2010, 1003, 'TECLADO', 'BCC', '20250010', 'Teclado para equipamento recebido anteriormente.', '2025-10-08', 'ENTREGUE', true, true),
(2011, 1007, 'MOUSE', 'GI', '20250011', 'Mouse para atividades em laboratorio.', '2025-11-06', 'ENTREGUE', true, true),
(2012, 1008, 'COMPUTADOR', 'DESIGN_DE_PRODUTO', '20250012', 'Computador para modelagem e trabalhos finais.', '2025-12-03', 'ENTREGUE', true, true),
(2013, 1003, 'NOTEBOOK', 'TADS', '20260001', 'Solicitacao pendente para testar fila de atendimento.', '2026-01-15', 'PENDENTE', true, true),
(2014, 1007, 'MONITOR', 'BCC', '20260002', 'Solicitacao aprovada aguardando vinculacao.', '2026-02-12', 'APROVADO', true, true);

INSERT IGNORE INTO doacao
(id, doador_id, equipamento, quantidade, descricao, status_conservacao, data_cadastro, data_entrega, status, solicitacao_id) VALUES
(3001, 1004, 'NOTEBOOK', 1, 'Notebook Dell i5 com carregador, bom para atividades academicas.', 'USADO', '2025-01-10', '2025-01-22', 'DOADO', 2001),
(3002, 1005, 'COMPUTADOR', 1, 'Desktop completo com gabinete, fonte e SSD.', 'USADO', '2025-02-08', '2025-02-20', 'DOADO', 2002),
(3003, 1006, 'MONITOR', 1, 'Monitor LED 22 polegadas em bom estado.', 'USADO', '2025-03-06', '2025-03-19', 'DOADO', 2003),
(3004, 1004, 'TECLADO', 1, 'Teclado USB funcionando corretamente.', 'USADO', '2025-04-11', '2025-04-23', 'DOADO', 2004),
(3005, 1005, 'MOUSE', 1, 'Mouse optico USB novo.', 'NOVO', '2025-05-09', '2025-05-21', 'DOADO', 2005),
(3006, 1006, 'NOTEBOOK', 1, 'Notebook Lenovo com bateria regular.', 'USADO', '2025-06-07', '2025-06-25', 'DOADO', 2006),
(3007, 1004, 'COMPUTADOR', 1, 'Computador de mesa revisado para uso basico.', 'USADO', '2025-07-05', '2025-07-18', 'DOADO', 2007),
(3008, 1005, 'MONITOR', 1, 'Monitor 24 polegadas com cabo HDMI.', 'USADO', '2025-08-13', '2025-08-28', 'DOADO', 2008),
(3009, 1006, 'NOTEBOOK', 1, 'Notebook Acer com SSD e 8GB RAM.', 'USADO', '2025-09-04', '2025-09-17', 'DOADO', 2009),
(3010, 1004, 'TECLADO', 1, 'Teclado ABNT2 em bom estado.', 'USADO', '2025-10-10', '2025-10-24', 'DOADO', 2010),
(3011, 1005, 'MOUSE', 1, 'Mouse sem fio com receptor USB.', 'USADO', '2025-11-08', '2025-11-20', 'DOADO', 2011),
(3012, 1006, 'COMPUTADOR', 1, 'Desktop i3 com monitor e perifericos.', 'USADO', '2025-12-05', '2025-12-18', 'DOADO', 2012),
(3013, 1004, 'NOTEBOOK', 1, 'Notebook aguardando avaliacao tecnica.', 'USADO', '2026-01-18', NULL, 'PENDENTE', NULL),
(3014, 1005, 'MONITOR', 1, 'Monitor aprovado e disponivel em estoque.', 'USADO', '2026-02-18', NULL, 'ESTOQUE', NULL),
(3015, 1006, 'COMPUTADOR', 1, 'Computador em reparo para troca de memoria.', 'REPARO', '2026-03-10', NULL, 'REPARO', NULL),
(3016, 1004, 'MOUSE', 2, 'Mouses novos para estoque.', 'NOVO', '2026-04-04', NULL, 'APROVADO', NULL),
(3017, 1005, 'TECLADO', 1, 'Teclado com defeito nas teclas principais.', 'REPARO', '2026-05-03', NULL, 'REPROVADO', NULL),
(3018, 1006, 'NOTEBOOK', 1, 'Notebook vinculado aguardando retirada.', 'USADO', '2026-06-01', NULL, 'VINCULADO', 2014);

INSERT IGNORE INTO reparo
(id, descricao, conclusao, id_tecnico, data_inicio, data_fim, doacao_id) VALUES
(4001, 'Troca de memoria RAM e limpeza interna.', NULL, 1002, '2026-03-12', NULL, 3015);

INSERT IGNORE INTO historico_status
(id, tipo_entidade, data_alteracao, observacao, executor, status, doacao_id, solicitacao_id) VALUES
(5001, 'solicitacao', '2025-01-08 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2001),
(5002, 'doacao', '2025-01-22 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3001, NULL),
(5003, 'solicitacao', '2025-02-06 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2002),
(5004, 'doacao', '2025-02-20 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3002, NULL),
(5005, 'solicitacao', '2025-03-04 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2003),
(5006, 'doacao', '2025-03-19 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3003, NULL),
(5007, 'solicitacao', '2025-04-09 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2004),
(5008, 'doacao', '2025-04-23 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3004, NULL),
(5009, 'solicitacao', '2025-05-07 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2005),
(5010, 'doacao', '2025-05-21 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3005, NULL),
(5011, 'solicitacao', '2025-06-05 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2006),
(5012, 'doacao', '2025-06-25 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3006, NULL),
(5013, 'solicitacao', '2025-07-03 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2007),
(5014, 'doacao', '2025-07-18 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3007, NULL),
(5015, 'solicitacao', '2025-08-11 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2008),
(5016, 'doacao', '2025-08-28 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3008, NULL),
(5017, 'solicitacao', '2025-09-02 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2009),
(5018, 'doacao', '2025-09-17 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3009, NULL),
(5019, 'solicitacao', '2025-10-08 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2010),
(5020, 'doacao', '2025-10-24 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3010, NULL),
(5021, 'solicitacao', '2025-11-06 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2011),
(5022, 'doacao', '2025-11-20 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3011, NULL),
(5023, 'solicitacao', '2025-12-03 09:00:00', 'Solicitacao cadastrada para teste.', 'Sistema', 'PENDENTE', NULL, 2012),
(5024, 'doacao', '2025-12-18 16:00:00', 'Doacao entregue ao solicitante.', 'Administrador Teste', 'DOADO', 3012, NULL),
(5025, 'doacao', '2026-01-18 10:00:00', 'Doacao recebida e aguardando analise.', 'Sistema', 'PENDENTE', 3013, NULL),
(5026, 'doacao', '2026-02-18 10:00:00', 'Doacao aprovada para estoque.', 'Tecnico Teste', 'ESTOQUE', 3014, NULL),
(5027, 'doacao', '2026-03-12 10:00:00', 'Doacao enviada para reparo.', 'Tecnico Teste', 'REPARO', 3015, NULL),
(5028, 'doacao', '2026-04-04 10:00:00', 'Doacao aprovada.', 'Tecnico Teste', 'APROVADO', 3016, NULL),
(5029, 'doacao', '2026-05-03 10:00:00', 'Doacao reprovada por defeito grave.', 'Tecnico Teste', 'REPROVADO', 3017, NULL),
(5030, 'doacao', '2026-06-01 10:00:00', 'Doacao vinculada a solicitacao aprovada.', 'Administrador Teste', 'VINCULADO', 3018, NULL),
(5031, 'solicitacao', '2026-01-15 09:00:00', 'Solicitacao aguardando avaliacao.', 'Sistema', 'PENDENTE', NULL, 2013),
(5032, 'solicitacao', '2026-02-12 09:00:00', 'Solicitacao aprovada aguardando equipamento.', 'Administrador Teste', 'APROVADO', NULL, 2014);


INSERT IGNORE INTO solicitacao
(id, usuario_id, equipamento, curso, grr, motivo, data_cadastro, status, ativo, sem_computador) VALUES
(2101, 1007, 'MOUSE', 'BCC', '20250101', 'Mouse para uso em aulas praticas.', '2025-01-14', 'ENTREGUE', true, true),
(2102, 1003, 'NOTEBOOK', 'TADS', '20250301', 'Notebook para projeto integrador.', '2025-03-09', 'ENTREGUE', true, true),
(2103, 1007, 'TECLADO', 'GI', '20250302', 'Teclado para estudo remoto.', '2025-03-13', 'ENTREGUE', true, true),
(2104, 1008, 'COMPUTADOR', 'DESIGN_GRAFICO', '20250401', 'Computador para atividades graficas.', '2025-04-16', 'ENTREGUE', true, true),
(2105, 1003, 'MONITOR', 'ENGENHARIA_CIVIL', '20250501', 'Monitor para acompanhamento de aulas online.', '2025-05-12', 'ENTREGUE', true, true),
(2106, 1007, 'NOTEBOOK', 'ENGENHARIA_ELETRICA', '20250502', 'Notebook para softwares academicos.', '2025-05-15', 'ENTREGUE', true, true),
(2107, 1008, 'TECLADO', 'TADS', '20250503', 'Teclado para laboratorio.', '2025-05-20', 'ENTREGUE', true, true),
(2108, 1003, 'MOUSE', 'BCC', '20250701', 'Mouse para completar equipamento recebido.', '2025-07-09', 'ENTREGUE', true, true),
(2109, 1007, 'MONITOR', 'ARQUITETURA_E_URBANISMO', '20250702', 'Monitor para projetos academicos.', '2025-07-16', 'ENTREGUE', true, true),
(2110, 1008, 'COMPUTADOR', 'ENGENHARIA_MECANICA', '20250801', 'Computador para atividades de modelagem.', '2025-08-18', 'ENTREGUE', true, true),
(2111, 1003, 'NOTEBOOK', 'GI', '20250901', 'Notebook para pesquisa e trabalhos.', '2025-09-06', 'ENTREGUE', true, true),
(2112, 1007, 'MOUSE', 'TADS', '20250902', 'Mouse USB para notebook.', '2025-09-10', 'ENTREGUE', true, true),
(2113, 1008, 'TECLADO', 'BCC', '20250903', 'Teclado ABNT2 para estudos.', '2025-09-14', 'ENTREGUE', true, true),
(2114, 1003, 'MONITOR', 'DESIGN_DE_PRODUTO', '20250904', 'Monitor para desenvolvimento de prototipos.', '2025-09-19', 'ENTREGUE', true, true),
(2115, 1007, 'COMPUTADOR', 'ENGENHARIA_CARTOGRAFICA', '20251001', 'Computador para softwares de mapas.', '2025-10-15', 'ENTREGUE', true, true),
(2116, 1008, 'NOTEBOOK', 'ARQUITETURA_E_URBANISMO', '20251101', 'Notebook para projetos de arquitetura.', '2025-11-10', 'ENTREGUE', true, true),
(2117, 1003, 'MOUSE', 'GI', '20251102', 'Mouse para atividades em sala.', '2025-11-14', 'ENTREGUE', true, true),
(2118, 1007, 'MONITOR', 'TADS', '20251201', 'Monitor para conclusao de curso.', '2025-12-08', 'ENTREGUE', true, true),
(2119, 1008, 'TECLADO', 'BCC', '20251202', 'Teclado para atividades finais.', '2025-12-12', 'ENTREGUE', true, true),
(2120, 1003, 'NOTEBOOK', 'ENGENHARIA_ELETRICA', '20251203', 'Notebook para provas e trabalhos finais.', '2025-12-16', 'ENTREGUE', true, true);

INSERT IGNORE INTO doacao
(id, doador_id, equipamento, quantidade, descricao, status_conservacao, data_cadastro, data_entrega, status, solicitacao_id) VALUES
(3101, 1005, 'MOUSE', 1, 'Mouse USB em bom estado.', 'USADO', '2025-01-15', '2025-01-27', 'DOADO', 2101),
(3102, 1004, 'NOTEBOOK', 1, 'Notebook com SSD para uso academico.', 'USADO', '2025-03-10', '2025-03-24', 'DOADO', 2102),
(3103, 1006, 'TECLADO', 1, 'Teclado USB revisado.', 'USADO', '2025-03-14', '2025-03-27', 'DOADO', 2103),
(3104, 1005, 'COMPUTADOR', 1, 'Desktop com memoria expandida.', 'USADO', '2025-04-17', '2025-04-29', 'DOADO', 2104),
(3105, 1004, 'MONITOR', 1, 'Monitor 21 polegadas.', 'USADO', '2025-05-13', '2025-05-26', 'DOADO', 2105),
(3106, 1005, 'NOTEBOOK', 1, 'Notebook i3 com carregador.', 'USADO', '2025-05-16', '2025-05-28', 'DOADO', 2106),
(3107, 1006, 'TECLADO', 1, 'Teclado novo lacrado.', 'NOVO', '2025-05-21', '2025-05-30', 'DOADO', 2107),
(3108, 1004, 'MOUSE', 1, 'Mouse sem fio funcionando.', 'USADO', '2025-07-10', '2025-07-22', 'DOADO', 2108),
(3109, 1005, 'MONITOR', 1, 'Monitor Full HD.', 'USADO', '2025-07-17', '2025-07-30', 'DOADO', 2109),
(3110, 1006, 'COMPUTADOR', 1, 'Computador completo para estudo.', 'USADO', '2025-08-19', '2025-08-29', 'DOADO', 2110),
(3111, 1004, 'NOTEBOOK', 1, 'Notebook usado com bateria boa.', 'USADO', '2025-09-07', '2025-09-18', 'DOADO', 2111),
(3112, 1005, 'MOUSE', 1, 'Mouse novo para notebook.', 'NOVO', '2025-09-11', '2025-09-22', 'DOADO', 2112),
(3113, 1006, 'TECLADO', 1, 'Teclado ABNT2 funcionando.', 'USADO', '2025-09-15', '2025-09-25', 'DOADO', 2113),
(3114, 1004, 'MONITOR', 1, 'Monitor com cabo HDMI.', 'USADO', '2025-09-20', '2025-09-30', 'DOADO', 2114),
(3115, 1005, 'COMPUTADOR', 1, 'Desktop para aplicativos de mapas.', 'USADO', '2025-10-16', '2025-10-29', 'DOADO', 2115),
(3116, 1006, 'NOTEBOOK', 1, 'Notebook para projetos academicos.', 'USADO', '2025-11-11', '2025-11-25', 'DOADO', 2116),
(3117, 1004, 'MOUSE', 1, 'Mouse USB simples.', 'USADO', '2025-11-15', '2025-11-27', 'DOADO', 2117),
(3118, 1005, 'MONITOR', 1, 'Monitor LED para estudos.', 'USADO', '2025-12-09', '2025-12-20', 'DOADO', 2118),
(3119, 1006, 'TECLADO', 1, 'Teclado novo ABNT2.', 'NOVO', '2025-12-13', '2025-12-23', 'DOADO', 2119),
(3120, 1004, 'NOTEBOOK', 1, 'Notebook revisado para fim de semestre.', 'USADO', '2025-12-17', '2025-12-27', 'DOADO', 2120);

INSERT IGNORE INTO historico_status
(id, tipo_entidade, data_alteracao, observacao, executor, status, doacao_id, solicitacao_id) VALUES
(5101, 'doacao', '2025-01-27 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3101, NULL),
(5102, 'doacao', '2025-03-24 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3102, NULL),
(5103, 'doacao', '2025-03-27 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3103, NULL),
(5104, 'doacao', '2025-04-29 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3104, NULL),
(5105, 'doacao', '2025-05-26 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3105, NULL),
(5106, 'doacao', '2025-05-28 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3106, NULL),
(5107, 'doacao', '2025-05-30 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3107, NULL),
(5108, 'doacao', '2025-07-22 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3108, NULL),
(5109, 'doacao', '2025-07-30 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3109, NULL),
(5110, 'doacao', '2025-08-29 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3110, NULL),
(5111, 'doacao', '2025-09-18 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3111, NULL),
(5112, 'doacao', '2025-09-22 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3112, NULL),
(5113, 'doacao', '2025-09-25 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3113, NULL),
(5114, 'doacao', '2025-09-30 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3114, NULL),
(5115, 'doacao', '2025-10-29 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3115, NULL),
(5116, 'doacao', '2025-11-25 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3116, NULL),
(5117, 'doacao', '2025-11-27 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3117, NULL),
(5118, 'doacao', '2025-12-20 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3118, NULL),
(5119, 'doacao', '2025-12-23 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3119, NULL),
(5120, 'doacao', '2025-12-27 16:00:00', 'Doacao extra entregue para variar grafico mensal.', 'Administrador Teste', 'DOADO', 3120, NULL);

-- Doacoes aprovadas, ainda nao vinculadas, para aparecerem no contador de status atual APROVADO.
INSERT IGNORE INTO doacao
(id, doador_id, equipamento, quantidade, descricao, status_conservacao, data_cadastro, data_entrega, status, solicitacao_id) VALUES
(3019, 1004, 'NOTEBOOK', 1, 'Notebook aprovado aguardando solicitacao compativel.', 'USADO', '2026-06-03', NULL, 'APROVADO', NULL),
(3020, 1005, 'COMPUTADOR', 1, 'Computador aprovado e pronto para vinculacao.', 'USADO', '2026-06-04', NULL, 'APROVADO', NULL),
(3021, 1006, 'MONITOR', 1, 'Monitor aprovado pelo tecnico.', 'USADO', '2026-06-05', NULL, 'APROVADO', NULL),
(3022, 1004, 'TECLADO', 2, 'Teclados aprovados para distribuicao.', 'NOVO', '2026-06-06', NULL, 'APROVADO', NULL);

INSERT IGNORE INTO historico_status
(id, tipo_entidade, data_alteracao, observacao, executor, status, doacao_id, solicitacao_id) VALUES
(5121, 'doacao', '2026-06-03 11:00:00', 'Doacao aprovada e aguardando vinculacao.', 'Tecnico Teste', 'APROVADO', 3019, NULL),
(5122, 'doacao', '2026-06-04 11:00:00', 'Doacao aprovada e aguardando vinculacao.', 'Tecnico Teste', 'APROVADO', 3020, NULL),
(5123, 'doacao', '2026-06-05 11:00:00', 'Doacao aprovada e aguardando vinculacao.', 'Tecnico Teste', 'APROVADO', 3021, NULL),
(5124, 'doacao', '2026-06-06 11:00:00', 'Doacao aprovada e aguardando vinculacao.', 'Tecnico Teste', 'APROVADO', 3022, NULL);

-- Historico realista: antes de ser vinculada/entregue, a doacao passa por APROVADO.
INSERT IGNORE INTO historico_status
(id, tipo_entidade, data_alteracao, observacao, executor, status, doacao_id, solicitacao_id) VALUES
(5201, 'doacao', '2025-01-15 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3001, NULL),
(5202, 'doacao', '2025-02-13 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3002, NULL),
(5203, 'doacao', '2025-03-11 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3003, NULL),
(5204, 'doacao', '2025-04-16 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3004, NULL),
(5205, 'doacao', '2025-05-14 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3005, NULL),
(5206, 'doacao', '2025-06-12 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3006, NULL),
(5207, 'doacao', '2025-07-10 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3007, NULL),
(5208, 'doacao', '2025-08-18 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3008, NULL),
(5209, 'doacao', '2025-09-09 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3009, NULL),
(5210, 'doacao', '2025-10-15 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3010, NULL),
(5211, 'doacao', '2025-11-13 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3011, NULL),
(5212, 'doacao', '2025-12-10 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3012, NULL),
(5213, 'doacao', '2026-05-30 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3018, NULL),
(5214, 'doacao', '2025-01-20 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3101, NULL),
(5215, 'doacao', '2025-03-15 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3102, NULL),
(5216, 'doacao', '2025-03-19 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3103, NULL),
(5217, 'doacao', '2025-04-22 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3104, NULL),
(5218, 'doacao', '2025-05-18 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3105, NULL),
(5219, 'doacao', '2025-05-21 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3106, NULL),
(5220, 'doacao', '2025-05-25 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3107, NULL),
(5221, 'doacao', '2025-07-15 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3108, NULL),
(5222, 'doacao', '2025-07-22 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3109, NULL),
(5223, 'doacao', '2025-08-24 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3110, NULL),
(5224, 'doacao', '2025-09-12 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3111, NULL),
(5225, 'doacao', '2025-09-16 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3112, NULL),
(5226, 'doacao', '2025-09-20 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3113, NULL),
(5227, 'doacao', '2025-09-25 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3114, NULL),
(5228, 'doacao', '2025-10-21 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3115, NULL),
(5229, 'doacao', '2025-11-16 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3116, NULL),
(5230, 'doacao', '2025-11-20 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3117, NULL),
(5231, 'doacao', '2025-12-14 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3118, NULL),
(5232, 'doacao', '2025-12-18 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3119, NULL),
(5233, 'doacao', '2025-12-22 10:00:00', 'Doacao aprovada antes da vinculacao.', 'Tecnico Teste', 'APROVADO', 3120, NULL);

-- Corrigir solicitações sem status
UPDATE solicitacao
SET status = 'PENDENTE'
WHERE status = '';

-- Corrigir doações sem status
UPDATE doacao
SET status = 'PENDENTE'
WHERE status = '';

UPDATE historico_status
SET status = 'PENDENTE'
WHERE status = ''