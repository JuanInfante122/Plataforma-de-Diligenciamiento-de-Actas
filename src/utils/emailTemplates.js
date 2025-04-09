const plantillaDocumentoNuevo = ({ 
  nombreAprendiz, 
  tipoDocumento, 
  numeroFicha, 
  programa 
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Nuevo Documento para Revisión</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Se ha recibido un nuevo documento para revisión con los siguientes detalles:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Aprendiz:</strong> ${nombreAprendiz}</p>
          <p><strong>Tipo de Documento:</strong> ${tipoDocumento}</p>
          <p><strong>Ficha:</strong> ${numeroFicha}</p>
          <p><strong>Programa:</strong> ${programa}</p>
        </div>
        
        <p>Por favor, ingrese al sistema para revisar el documento:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/revision" 
             style="background-color: #003366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Revisar Documento
          </a>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
        <p>Sistema de Documentación SENA</p>
      </div>
    </div>
  `;
};

const plantillaDocumentoAprobado = ({ 
  nombreAprendiz, 
  tipoDocumento
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Documento Aprobado</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Nos complace informarle que su documento ha sido aprobado:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Aprendiz:</strong> ${nombreAprendiz}</p>
          <p><strong>Tipo de Documento:</strong> ${tipoDocumento}</p>
          <p><strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">APROBADO</span></p>
        </div>
        
        <p>Puede acceder a su documento aprobado en el sistema:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/documentos" 
             style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Ver Documento
          </a>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
        <p>Sistema de Documentación SENA</p>
      </div>
    </div>
  `;
};

const plantillaDocumentoRechazado = ({ 
  nombreAprendiz, 
  tipoDocumento, 
  comentarios 
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Documento Requiere Correcciones</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Su documento ha sido revisado y requiere algunas correcciones:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Aprendiz:</strong> ${nombreAprendiz}</p>
          <p><strong>Tipo de Documento:</strong> ${tipoDocumento}</p>
          <p><strong>Estado:</strong> <span style="color: #dc3545; font-weight: bold;">REQUIERE CORRECCIONES</span></p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0;">Comentarios del revisor:</h3>
          <p>${comentarios || "No se proporcionaron comentarios específicos."}</p>
        </div>
        
        <p>Por favor realice las correcciones necesarias y vuelva a subir el documento:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/documentos" 
             style="background-color: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Corregir Documento
          </a>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
        <p>Sistema de Documentación SENA</p>
      </div>
    </div>
  `;
};

const plantillaRecordatorio = ({ 
  nombreAprendiz, 
  tipoDocumento, 
  fechaLimite 
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ffc107; color: #212529; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Recordatorio: Documento Pendiente</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Le recordamos que tiene un documento pendiente por entregar:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Aprendiz:</strong> ${nombreAprendiz}</p>
          <p><strong>Tipo de Documento:</strong> ${tipoDocumento}</p>
          <p><strong>Fecha límite:</strong> <span style="color: #dc3545; font-weight: bold;">${fechaLimite}</span></p>
        </div>
        
        <p>Por favor, suba su documento lo antes posible:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/documentos/nuevo" 
             style="background-color: #ffc107; color: #212529; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Subir Documento
          </a>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>Este es un correo automático, por favor no responda a este mensaje.</p>
        <p>Sistema de Documentación SENA</p>
      </div>
    </div>
  `;
};

module.exports = {
  plantillaDocumentoNuevo,
  plantillaDocumentoAprobado,
  plantillaDocumentoRechazado,
  plantillaRecordatorio
};
