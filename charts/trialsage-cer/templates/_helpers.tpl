{{/*
Expand the name of the chart.
*/}}
{{- define "trialsage-cer.name" -}}
{{- default .Chart.Name .Values.global.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "trialsage-cer.fullname" -}}
{{- if .Values.global.fullnameOverride }}
{{- .Values.global.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.global.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "trialsage-cer.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create the namespace name
*/}}
{{- define "trialsage-cer.namespace" -}}
{{- default (printf "%s-system" (include "trialsage-cer.name" .)) .Values.namespace.name }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "trialsage-cer.labels" -}}
helm.sh/chart: {{ include "trialsage-cer.chart" . }}
{{ include "trialsage-cer.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "trialsage-cer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "trialsage-cer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use for the API component
*/}}
{{- define "trialsage-cer.api.serviceAccountName" -}}
{{- if .Values.api.serviceAccount.create }}
{{- default (printf "%s-api" (include "trialsage-cer.fullname" .)) .Values.api.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.api.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use for the Worker component
*/}}
{{- define "trialsage-cer.worker.serviceAccountName" -}}
{{- if .Values.worker.serviceAccount.create }}
{{- default (printf "%s-worker" (include "trialsage-cer.fullname" .)) .Values.worker.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.worker.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create a default fully qualified postgresql name.
*/}}
{{- define "trialsage-cer.postgresql.fullname" -}}
{{- if .Values.postgresql.fullnameOverride -}}
{{- .Values.postgresql.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default "postgresql" .Values.postgresql.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Create a default fully qualified redis name.
*/}}
{{- define "trialsage-cer.redis.fullname" -}}
{{- if .Values.redis.fullnameOverride -}}
{{- .Values.redis.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default "redis" .Values.redis.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Generate the PostgreSQL connection string
*/}}
{{- define "trialsage-cer.postgresql.connectionString" -}}
{{- $username := default "trialsage" .Values.postgresql.auth.username -}}
{{- $password := .Values.postgresql.auth.password -}}
{{- $database := default "cer" .Values.postgresql.auth.database -}}
{{- $host := include "trialsage-cer.postgresql.fullname" . -}}
{{- printf "postgresql://%s:%s@%s:5432/%s" $username $password $host $database -}}
{{- end -}}

{{/*
Generate the Redis connection string
*/}}
{{- define "trialsage-cer.redis.connectionString" -}}
{{- $password := .Values.redis.auth.password -}}
{{- $host := include "trialsage-cer.redis.fullname" . -}}
{{- if $password -}}
{{- printf "redis://:%s@%s-master:6379" $password $host -}}
{{- else -}}
{{- printf "redis://%s-master:6379" $host -}}
{{- end -}}
{{- end -}}