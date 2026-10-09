create database if not exists isla character set utf8mb4 collate utf8mb4_unicode_ci;
use isla;

drop table if exists asignaciones;
drop table if exists ninos;
drop table if exists alertas;
drop table if exists hogares;
drop table if exists usuarios;
drop table if exists roles;

create table roles (
  id tinyint unsigned not null auto_increment,
  nombre varchar(30) not null,
  descripcion varchar(120) not null,
  primary key (id),
  unique key uq_roles_nombre (nombre)
) engine=innodb;

create table usuarios (
  id int unsigned not null auto_increment,
  rol_id tinyint unsigned not null,
  nombre varchar(80) not null,
  email varchar(120) not null,
  clave_hash varchar(100) not null,
  telefono varchar(20) null,
  activo tinyint(1) not null default 1,
  creado_en timestamp not null default current_timestamp,
  primary key (id),
  unique key uq_usuarios_email (email),
  key idx_usuarios_rol (rol_id),
  constraint fk_usuarios_rol foreign key (rol_id) references roles (id)
) engine=innodb;

create table hogares (
  id int unsigned not null auto_increment,
  nombre varchar(100) not null,
  tipo enum('hogar_temporal','familia_acogida','centro_proteccion') not null,
  direccion varchar(160) null,
  municipio varchar(80) not null,
  telefono varchar(20) null,
  capacidad smallint unsigned not null,
  ocupados smallint unsigned not null default 0,
  activo tinyint(1) not null default 1,
  creado_en timestamp not null default current_timestamp,
  primary key (id),
  key idx_hogares_municipio (municipio),
  constraint chk_hogares_cupo check (ocupados <= capacidad)
) engine=innodb;

create table alertas (
  id int unsigned not null auto_increment,
  usuario_id int unsigned not null,
  titulo varchar(120) not null,
  descripcion text not null,
  ubicacion varchar(160) not null,
  edad_aprox tinyint unsigned null,
  prioridad enum('baja','media','alta') not null default 'media',
  estado enum('pendiente','en_revision','atendida','descartada') not null default 'pendiente',
  creado_en timestamp not null default current_timestamp,
  actualizado_en timestamp not null default current_timestamp on update current_timestamp,
  primary key (id),
  key idx_alertas_usuario (usuario_id),
  key idx_alertas_estado (estado),
  constraint fk_alertas_usuario foreign key (usuario_id) references usuarios (id)
) engine=innodb;

create table ninos (
  id int unsigned not null auto_increment,
  alerta_id int unsigned null,
  registrado_por int unsigned not null,
  nombres varchar(80) not null,
  apellidos varchar(80) null,
  fecha_nacimiento date null,
  sexo enum('f','m') not null,
  estado enum('en_riesgo','en_proceso','acogido','reintegrado') not null default 'en_riesgo',
  observaciones varchar(500) null,
  creado_en timestamp not null default current_timestamp,
  primary key (id),
  key idx_ninos_estado (estado),
  key idx_ninos_alerta (alerta_id),
  constraint fk_ninos_alerta foreign key (alerta_id) references alertas (id) on delete set null,
  constraint fk_ninos_registrador foreign key (registrado_por) references usuarios (id)
) engine=innodb;

create table asignaciones (
  id int unsigned not null auto_increment,
  nino_id int unsigned not null,
  hogar_id int unsigned not null,
  solicitado_por int unsigned not null,
  resuelto_por int unsigned null,
  estado enum('pendiente','aprobada','rechazada','completada') not null default 'pendiente',
  motivo varchar(500) not null,
  respuesta varchar(255) null,
  creado_en timestamp not null default current_timestamp,
  resuelto_en timestamp null,
  primary key (id),
  key idx_asignaciones_estado (estado),
  key idx_asignaciones_nino (nino_id),
  key idx_asignaciones_hogar (hogar_id),
  constraint fk_asignaciones_nino foreign key (nino_id) references ninos (id),
  constraint fk_asignaciones_hogar foreign key (hogar_id) references hogares (id),
  constraint fk_asignaciones_solicitante foreign key (solicitado_por) references usuarios (id),
  constraint fk_asignaciones_resolutor foreign key (resuelto_por) references usuarios (id)
) engine=innodb;

insert into roles (nombre, descripcion) values
  ('administrador', 'gestiona usuarios, aprueba asignaciones y ve todo el sistema'),
  ('trabajador_social', 'registra niños, hogares y solicita asignaciones'),
  ('ciudadano', 'reporta alertas de abandono infantil');
