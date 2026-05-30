# Sistema de Doacao - TCC

Sistema de gerenciamento de doacoes desenvolvido para o TCC.

O projeto possui:

- Backend: Java 21 com Spring Boot
- Frontend: Angular
- Banco de dados: MySQL 8
- Orquestracao local: Docker Compose

## Pre-requisitos

Para rodar o projeto com Docker, instale:

- Git
- Docker Desktop
- Docker Compose

Antes de executar o build, abra o Docker Desktop e aguarde o Docker Engine iniciar. Se o Docker nao estiver rodando, o comando `docker compose up --build` pode falhar ao tentar construir ou subir os containers.

No Windows, o Docker Compose ja vem junto com o Docker Desktop. Para conferir se esta tudo instalado, rode:

```powershell
git --version
docker --version
docker compose version
```

> Nao e necessario instalar Java, Maven, Node.js, Angular CLI ou MySQL para rodar pelo Docker. Essas dependencias sao usadas dentro das imagens Docker.

## Como Rodar Com Docker

Na raiz do projeto, execute:

```powershell
docker compose up --build
```

Esse comando constroi e sobe os tres servicos:

- `mysql`: banco de dados MySQL
- `backend`: API Spring Boot
- `frontend`: aplicacao Angular

Quando tudo estiver rodando, acesse:

- Frontend: http://localhost:4200/login
- Backend/Swagger: http://localhost:8080/swagger-ui/index.html


## Acessar o MySQL Pelo VS Code

Para visualizar o banco pelo VS Code, instale a extensao:

- Database Client

Depois de instalar:

1. Abra o VS Code.
2. Clique no icone do Database Client na barra lateral.
3. Clique em `Create Connection` ou no botao `+` para criar uma nova conexao.
4. Selecione `MySQL`.
5. Preencha os dados da conexao:

```text
Connection name: Sistema Doacao
Host: localhost
Port: 3306
Database: sistema_doacao
Username: root
Password: 1234
```

6. Clique em `Connect` ou `Test Connection`.
7. Se a conexao funcionar, salve a configuracao.

> Antes de testar a conexao, os containers precisam estar rodando com `docker compose up --build` 


## Rodar Sem Docker

Para rodar sem Docker, instale tambem:

- Java JDK 21
- Maven ou Maven Wrapper funcional
- Node.js compativel com Angular 20
- Angular CLI 20
- MySQL 8

Nesse caso, sera necessario subir o MySQL manualmente, rodar o backend pela pasta `backend` e o frontend pela pasta `frontend`.

## Comandos Uteis

Reconstruir tudo:

```powershell
docker compose up --build
```

Recriar containers:

```powershell
docker compose up --build --force-recreate
```

Ver containers:

```powershell
docker compose ps
```

Parar tudo:

```powershell
docker compose down
```

Limpar volumes:

```powershell
docker compose down -v
```
