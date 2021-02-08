<%
function stringifyValue(value) {
  if (typeof value === 'string') {
    return `'${value}'`
  } else if (value === undefined || value === null || typeof value === 'boolean' || typeof value === 'function') {
    return String(value);
  } else {
    return JSON.stringify(value)
  }
}

for (const [key, value] of Object.entries(options)) {
    if (['prepare','access'].includes(key) && typeof value === 'object') {
%>

<% value.forEach((plugin) => { %>export const <%= plugin.name.split('.')[0] %> = require('./<%= plugin.name %>').default

<% }) %>
<% } else { %>
export const <%= key %> = <%= stringifyValue(value) %>

<% } }
%>
