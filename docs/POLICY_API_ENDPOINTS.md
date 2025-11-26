# Policy API Endpoints & Response Structure

Complete documentation for Policy API endpoints and their response structures.

---

## 1. Get All Policies

### Endpoint
```
GET /api/policies?populate=*
```

### Response Structure
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Community Guidelines",
        "slug": "community-guidelines",
        "description": "<p>Policy description...</p>",
        "category": "Community Rules",
        "documents": [
          {
            "id": 1,
            "documentName": "Document Name",
            "file": {
              "data": {
                "id": 1,
                "attributes": {
                  "name": "filename.pdf",
                  "url": "/uploads/filename.pdf",
                  "mime": "application/pdf",
                  "size": 245.67,
                  "ext": ".pdf"
                }
              }
            }
          }
        ],
        "publishedAt": "2024-01-15T10:00:00.000Z",
        "createdAt": "2024-01-15T09:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### Alternative Flat Structure (Strapi v5)
```json
{
  "data": [
    {
      "id": 1,
      "title": "Community Guidelines",
      "slug": "community-guidelines",
      "description": "<p>Policy description...</p>",
      "category": "Community Rules",
      "documents": [
        {
          "id": 1,
          "documentName": "Document Name",
          "file": {
            "id": 1,
            "name": "filename.pdf",
            "url": "/uploads/filename.pdf",
            "mime": "application/pdf",
            "size": 245.67,
            "ext": ".pdf"
          }
        }
      ],
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

---

## 2. Get Policy by Slug (Details Page)

### Endpoint
```
GET /api/policies?filters[slug][$eq]={slug}&populate=*
```

### Example
```
GET /api/policies?filters[slug][$eq]=community-guidelines&populate=*
```

### Response Structure
```json
{
  "data": [
    {
      "id": 1,
      "title": "Community Guidelines",
      "slug": "community-guidelines",
      "description": "<p>Policy description...</p>",
      "category": "Community Rules",
      "documents": [
        {
          "id": 1,
          "documentName": "Community Guidelines - Full Document",
          "file": {
            "id": 1,
            "name": "community-guidelines.pdf",
            "url": "/uploads/community_guidelines.pdf",
            "mime": "application/pdf",
            "size": 245.67,
            "ext": ".pdf"
          }
        }
      ],
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### Notes
- Returns an **array** even for single result (filter query)
- First item `[0]` contains the policy
- Documents are nested in the policy object

---

## 3. Get Policy by ID (Alternative)

### Endpoint
```
GET /api/policies/{id}?populate=*
```

### Example
```
GET /api/policies/1?populate=*
```

### Response Structure
```json
{
  "data": {
    "id": 1,
    "title": "Community Guidelines",
    "slug": "community-guidelines",
    "description": "<p>Policy description...</p>",
    "category": "Community Rules",
    "documents": [
      {
        "id": 1,
        "documentName": "Community Guidelines - Full Document",
        "file": {
          "id": 1,
          "name": "community-guidelines.pdf",
          "url": "/uploads/community_guidelines.pdf",
          "mime": "application/pdf",
          "size": 245.67,
          "ext": ".pdf"
        }
      }
    ],
    "publishedAt": "2024-01-15T10:00:00.000Z",
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "meta": {}
}
```

### Notes
- Returns a **single object** (not array)
- Direct ID endpoint
- Used as fallback if slug lookup fails

---

## Document File Structure

### Structure 1: Nested (Strapi v4)
```json
{
  "file": {
    "data": {
      "id": 1,
      "attributes": {
        "name": "filename.pdf",
        "url": "/uploads/filename.pdf",
        "mime": "application/pdf",
        "size": 245.67,
        "ext": ".pdf"
      }
    }
  }
}
```

### Structure 2: Flat (Strapi v5) - **Current**
```json
{
  "file": {
    "id": 1,
    "name": "filename.pdf",
    "url": "/uploads/filename.pdf",
    "mime": "application/pdf",
    "size": 245.67,
    "ext": ".pdf"
  }
}
```

### Structure 3: Direct String
```json
{
  "file": "/uploads/filename.pdf"
}
```

---

## How the Code Handles These Structures

### Priority Order for File URL Extraction:

1. **Nested Structure** (Strapi v4):
   ```javascript
   doc.file?.data?.attributes?.url
   ```

2. **Flat Structure** (Strapi v5) - **Your Current Structure**:
   ```javascript
   doc.file?.url
   ```

3. **Direct String**:
   ```javascript
   typeof doc.file === "string"
   ```

### File URL Construction:

```javascript
// If URL starts with http, use as-is
if (url.startsWith("http")) {
  fileUrl = url;
}
// Otherwise, prepend Strapi URL
else {
  fileUrl = `${STRAPI_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}
// Example: /uploads/file.pdf → https://admin.greenwoodscity.in/uploads/file.pdf
```

---

## Complete Example: Policy Details Response

### Request
```
GET /api/policies?filters[slug][$eq]=community-guidelines&populate=*
```

### Full Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "j0u2nvbc7q374u9o7f4yyg3a",
      "title": "Community Guidelines",
      "slug": "community-guidelines",
      "description": "<p>This policy outlines the community guidelines...</p>",
      "category": "Community Rules",
      "documents": [
        {
          "id": 1,
          "documentName": "Community Guidelines - Full Document",
          "file": {
            "id": 1,
            "name": "community-guidelines.pdf",
            "url": "/uploads/community_guidelines.pdf",
            "mime": "application/pdf",
            "size": 245.67,
            "ext": ".pdf"
          }
        },
        {
          "id": 2,
          "documentName": "Community Guidelines - Summary",
          "file": {
            "id": 2,
            "name": "community-guidelines-summary.pdf",
            "url": "/uploads/community_guidelines_summary.pdf",
            "mime": "application/pdf",
            "size": 120.45,
            "ext": ".pdf"
          }
        }
      ],
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

---

## Extracted Policy Object (After Processing)

### Structure Used in Application
```typescript
{
  id: "1",
  slug: "community-guidelines",
  title: "Community Guidelines",
  description: "<p>This policy outlines...</p>",
  category: "Community Rules",
  documents: [
    {
      id: "1",
      documentName: "Community Guidelines - Full Document",
      file: "https://admin.greenwoodscity.in/uploads/community_guidelines.pdf",
      mime: "application/pdf",
      size: 245.67
    },
    {
      id: "2",
      documentName: "Community Guidelines - Summary",
      file: "https://admin.greenwoodscity.in/uploads/community_guidelines_summary.pdf",
      mime: "application/pdf",
      size: 120.45
    }
  ],
  updatedAt: "2024-01-15T10:00:00.000Z"
}
```

---

## API Endpoints Summary

| Purpose | Endpoint | Method | Returns |
|---------|----------|--------|---------|
| List all policies | `/api/policies?populate=*` | GET | Array of policies |
| Get by slug | `/api/policies?filters[slug][$eq]={slug}&populate=*` | GET | Array (single item) |
| Get by ID | `/api/policies/{id}?populate=*` | GET | Single object |

---

## Testing Endpoints

### Test in Browser/Postman

1. **List All Policies:**
   ```
   https://admin.greenwoodscity.in/api/policies?populate=*
   ```

2. **Get Policy by Slug:**
   ```
   https://admin.greenwoodscity.in/api/policies?filters[slug][$eq]=community-guidelines&populate=*
   ```

3. **Get Policy by ID:**
   ```
   https://admin.greenwoodscity.in/api/policies/1?populate=*
   ```

### Test with cURL

```bash
# List all policies
curl "https://admin.greenwoodscity.in/api/policies?populate=*"

# Get by slug
curl "https://admin.greenwoodscity.in/api/policies?filters[slug][\$eq]=community-guidelines&populate=*"

# Get by ID
curl "https://admin.greenwoodscity.in/api/policies/1?populate=*"
```

---

## Common Issues & Solutions

### Issue 1: Documents Not Showing

**Problem:** Documents exist in API but not displayed

**Check:**
1. Verify `populate=*` is in URL
2. Check if documents array exists in response
3. Verify file URL is being extracted correctly
4. Check browser console for debug logs

**Solution:** Ensure populate includes documents and file:
```
populate[documents][populate][file]=*
```

### Issue 2: File URL Not Working

**Problem:** File URL is relative but needs to be absolute

**Solution:** Code automatically prepends Strapi URL:
- `/uploads/file.pdf` → `https://admin.greenwoodscity.in/uploads/file.pdf`

### Issue 3: Empty Documents Array

**Problem:** Documents array is empty or null

**Check:**
1. Verify documents are published in Strapi
2. Check document permissions
3. Ensure file is uploaded and linked

---

## Required Strapi Configuration

### Content Type: Policy

**Fields:**
- `title` (Text, required)
- `slug` (UID, required, unique)
- `description` (Rich Text)
- `category` (Text)
- `documents` (Component - repeatable)

### Component: Document

**Fields:**
- `documentName` (Text, required)
- `file` (Media, single file)

### Permissions

**Public Role:**
- Policy: `find`, `findOne` ✅
- Document component: Read access ✅

---

## Response Field Mapping

| Strapi Field | Application Field | Type |
|--------------|-------------------|------|
| `id` | `id` | string |
| `slug` | `slug` | string |
| `title` | `title` | string |
| `description` | `description` | string (HTML) |
| `category` | `category` | string |
| `documents[].id` | `documents[].id` | string |
| `documents[].documentName` | `documents[].documentName` | string |
| `documents[].file.url` | `documents[].file` | string (full URL) |
| `documents[].file.mime` | `documents[].mime` | string |
| `documents[].file.size` | `documents[].size` | number |
| `updatedAt` | `updatedAt` | string (ISO date) |

---

## Debugging

### Enable Debug Logs

Check PM2 logs or browser console for:
- `📄 [getPolicyBySlug] Documents data:` - Shows document extraction
- `📄 [getPolicyBySlug] Processing document:` - Shows each document
- `📄 [getPolicyBySlug] Extracted file:` - Shows file URL extraction
- `📄 [getPolicyBySlug] Final documents:` - Shows final result

### View Logs
```bash
# On VPS
pm2 logs greenwood-city --lines 100 | grep -i "policy\|document"
```

---

## Summary

**Main Endpoint for Details Page:**
```
GET /api/policies?filters[slug][$eq]={slug}&populate=*
```

**Response:** Array with single policy object containing documents array

**File Structure:** Flat structure with `file.url`, `file.mime`, `file.size`

**Code Handles:** All three file structures automatically



