Aquí tienes un prompt en Markdown listo para Claude para implementar el botón Importar Excel con drag & drop, vista previa, y validación en tiempo real, mapeando a las tablas Questions y QuestionOptions.

# TechPrep – Excel Import (Questions)

## Objetivo
Implementar un flujo de **Importación de Preguntas por Excel** con:
- **RF-F08.1**: Carga masiva con **drag & drop**.
- **RF-F08.2**: **Vista previa** de datos antes de importar.
- **RF-F08.3**: **Validación en tiempo real** con reporte de errores.
- Mapeo a las entidades:
  - **Questions**
    - Id (GUID, server)
    - TopicId (int, requerido)
    - Text (string, requerido)
    - Type (enum: `single_choice` | `multi_choice` | `written`)
    - Level (enum: `basic` | `intermediate` | `advanced`)
    - OfficialAnswer (string, requerido solo para `written`)
    - CreatedAt, UpdatedAt (server)
  - **QuestionOptions** (solo para `single_choice`/`multi_choice`)
    - Id (GUID, server)
    - QuestionId (FK, server)
    - Text (string, requerido)
    - IsCorrect (bool)
    - OrderIndex (int)

---

## Estructura del Excel (1 hoja)

### Columnas fijas (encabezados exactamente así):
- `Topic` (string; nombre del tema)
- `Level` (`basic|intermediate|advanced`)
- `Type` (`single_choice|multi_choice|written`)
- `Text` (enunciado/prompt)
- `Options` (texto con opciones separadas por `;`. Ej: `A) class;B) struct;C) interface`)
- `Correct` (letras separadas por `;`. Ej: `A;C`. Para written: vacío)
- `OfficialAnswer` (solo para `written`)

> Reglas:
> - **single_choice** → `Correct` debe tener **exactamente 1** letra.
> - **multi_choice** → `Correct` debe tener **≥1** letras.
> - **written** → `OfficialAnswer` **requerido**; `Options/Correct` se **ignoran**.

### Ejemplos de filas
- Single: `.NET | basic | single_choice | ¿Qué es una struct? | A) Tipo valor;B) Tipo ref | A |`
- Multiple: `C# | intermediate | multi_choice | Tipos por valor | A) struct;B) class;C) int | A;C |`
- Written: `React | basic | written | ¿Qué es el Virtual DOM? |  |  | Representación ligera del DOM...`

---

## Frontend (React + TS)

### UI/Flujo
- Botón **“Importar Excel”** en `/admin/questions` abre **Dialog** con pasos:
  1. **Upload** (drag & drop, acepta `.xlsx` y `.xls`, hasta 10MB).
  2. **Preview** (tabla con primeras 50 filas).
  3. **Validación** (panel de errores por fila/celda).
  4. **Confirmar importación** (commit).

- Controles:
  - **Dropzone**: arrastrar/soltar + selección manual.
  - **Botón “Validar”** → envía archivo a `/api/admin/imports/questions/validate`.
  - **Botón “Confirmar importación”** → `/api/admin/imports/questions/commit?importId=...`.
  - **Cancelar / Cerrar**.

### Componentes sugeridos
- `AdminImportDialog.tsx` (contenedor)
- `ExcelDropzone.tsx`
- `ImportPreviewTable.tsx` (TanStack Table)
- `ImportErrorPanel.tsx`
- `ImportStats.tsx` (rows válidas/erróneas, por tipo)
- `ImportFooterActions.tsx`

### Estado y validación (Zod)
- Parse local opcional (para UX temprano) + **validación definitiva en backend**.
- Zod de **fila parseada** (para vista previa/validación básica):

```ts
import { z } from 'zod';

export const rowSchema = z.object({
  Topic: z.string().min(1),
  Level: z.enum(['basic','intermediate','advanced']),
  Type: z.enum(['single_choice','multi_choice','written']),
  Text: z.string().min(5),
  Options: z.string().optional().default(''),
  Correct: z.string().optional().default(''),
  OfficialAnswer: z.string().optional().default('')
}).superRefine((v, ctx) => {
  if (v.Type === 'written') {
    if (!v.OfficialAnswer || v.OfficialAnswer.trim().length < 5) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['OfficialAnswer'], message: 'OfficialAnswer requerido (≥5 chars) para written'});
    }
  } else {
    const options = (v.Options ?? '').split(';').map(s => s.trim()).filter(Boolean);
    if (options.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['Options'], message: 'Mínimo 2 opciones para single/multi' });
    }
    const correct = new Set((v.Correct ?? '').split(';').map(s => s.trim().toUpperCase()).filter(Boolean));
    if (v.Type === 'single_choice' && correct.size !== 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['Correct'], message: 'single_choice requiere exactamente 1 correcta (A, B, ...)' });
    }
    if (v.Type === 'multi_choice' && correct.size < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['Correct'], message: 'multi_choice requiere ≥1 correctas (A;C;...)' });
    }
  }
});

Vista previa

Tabla con columnas: # (fila) | Topic | Level | Type | Text | Options (count) | Correct | OfficialAnswer | Estado

Estado muestra: OK o Errores (n) con tooltip/listado.

Paginación local para >50 filas.

Stats: total filas, válidas, inválidas; breakdown por Type.

Backend (.NET 8 + EF Core + EPPlus)
Endpoints

POST /api/admin/imports/questions/validate (multipart):

Lee el excel, valida, no inserta.

Devuelve:

{
  "importId": "guid",
  "summary": { "total": 123, "valid": 100, "invalid": 23, "byType": { "single_choice": 45, "multi_choice": 40, "written": 38 } },
  "preview": [ { "row": 2, "parsed": { ... }, "errors": [ { "field":"Correct", "message":"..." } ] }, ... ]
}


POST /api/admin/imports/questions/commit?importId=...:

Re-lee desde un almacen temporal (memoria/archivo/cache) o guarda el payload validado en un store temporal.

Inserta transaccional:

Questions (GUID server)

QuestionOptions (si aplica; orden según aparición)

Devuelve: { inserted: n, skipped: m, errors: [...] }.

Reglas de validación (backend definitivas)

Campos obligatorios: Topic, Type, Text.

Level en {basic, intermediate, advanced} (default: basic si vacío).

Type:

single_choice: Options ≥2; Correct tamaño 1; letras deben existir en Options.

multi_choice: Options ≥2; Correct tamaño ≥1; letras válidas.

written: OfficialAnswer requerido; Options/Correct ignorar.

Topic: si no existe por nombre → crearlo y usar su Id.

Trim de espacios; normalizar letras (A/B/C...) sin paréntesis.

Inserción (pseudocódigo)
foreach (var row in rowsValidas)
{
  // Topic
  var topic = await db.Topics.FirstOrDefaultAsync(t => t.Name == row.Topic)
           ?? db.Topics.Add(new Topic { Name = row.Topic }).Entity;
  await db.SaveChangesAsync();

  // Question
  var q = new Question {
    Id = Guid.NewGuid(),
    TopicId = topic.Id,
    Text = row.Text.Trim(),
    Type = MapType(row.Type),
    Level = MapLevel(row.Level),
    OfficialAnswer = row.Type == "written" ? row.OfficialAnswer?.Trim() : null,
    CreatedAt = DateTime.UtcNow,
    UpdatedAt = DateTime.UtcNow
  };
  db.Questions.Add(q);
  await db.SaveChangesAsync();

  // Options (solo single/multi)
  if (q.Type != QuestionType.Written)
  {
    var optList = ParseOptions(row.Options); // [(A, "class"), (B, "struct"), ...]
    var correct = ParseCorrect(row.Correct); // Set<string> { "A","C" }
    var idx = 0;
    foreach (var (letter, text) in optList)
    {
      db.QuestionOptions.Add(new QuestionOption {
        Id = Guid.NewGuid(),
        QuestionId = q.Id,
        Text = text,
        IsCorrect = correct.Contains(letter),
        OrderIndex = ++idx
      });
    }
    await db.SaveChangesAsync();
  }
}


Transacción: envolver todo el commit en using var tx = await db.Database.BeginTransactionAsync(); y await tx.CommitAsync(); (rollback on error).

Errores y reporte

Cada fila inválida debe incluir:

row (número)

field (Topic/Type/Text/Options/Correct/OfficialAnswer)

message (explicable)

El frontend muestra:

Contador de errores

Lista plegable de filas con errores

Botón para descargar CSV con reporte de errores

Aceptación

Drag & drop acepta .xlsx/.xls, muestra nombre y tamaño.

Vista previa muestra primeras 50 filas con estado OK/Errores.

Validación en backend marca correctamente:

single/multi con reglas de opciones/correct.

written con respuesta oficial.

Commit inserta Questions y QuestionOptions en una transacción.

Resumen posterior al commit: inserted, skipped, errors.

Manejo de Topics: crear si no existen.

Tiempos CreatedAt/UpdatedAt: set por servidor.