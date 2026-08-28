<?php
/**
 * Pure Napkin — Mailer del formulario de pedidos empresariales
 * ────────────────────────────────────────────────────────────
 * Recibe el formulario de js/script.js (JSON por POST), valida
 * y sanitiza los campos, y envía el correo con mail() nativo de PHP.
 *
 * ⚠️ CONFIGURAR ANTES DE PUBLICAR:
 *   - TO_EMAIL: correo donde llegan las solicitudes
 *   - FROM_EMAIL: debe ser un correo del MISMO dominio que el hosting
 *                 (muchos proveedores rechazan/marcan como spam si no)
 *
 * NOTA SOBRE HOSTING:
 *   La función mail() de PHP depende de que el servidor tenga un MTA
 *   (sendmail/postfix) configurado. Casi todo hosting compartido lo
 *   trae listo, pero si los correos no llegan (común en Gmail/Outlook
 *   por SPF/DKIM), la solución más confiable es cambiar a PHPMailer
 *   con SMTP autenticado (por ejemplo con las credenciales del mismo
 *   correo TO_EMAIL). Se deja indicado más abajo dónde hacer ese cambio.
 */

// ────────────────────────────────────────────────────────────
// CONFIGURACIÓN
// ────────────────────────────────────────────────────────────
const TO_EMAIL    = "pedidos@purenapkinrd.com";   // ⚠️ reemplazar con el correo real
const FROM_EMAIL  = "no-reply@purenapkinrd.com";  // ⚠️ debe ser del mismo dominio del hosting
const SITE_NAME   = "Pure Napkin";
// ────────────────────────────────────────────────────────────

header("Content-Type: application/json; charset=UTF-8");

// Solo aceptar POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
    exit;
}

// Leer el cuerpo (el front-end envía JSON)
$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

// Si no vino como JSON, intentar leer como formulario normal (fallback)
if (!is_array($data)) {
    $data = $_POST;
}

// Honeypot anti-spam: si el campo oculto "website" viene lleno, es un bot.
if (!empty($data["website"])) {
    // Respondemos éxito falso para no delatar el honeypot a los bots.
    echo json_encode(["success" => true]);
    exit;
}

/**
 * Limpia texto de una sola línea: quita etiquetas y saltos de línea
 * (evita inyección de encabezados de correo).
 */
function clean_line(string $value): string
{
    $value = strip_tags($value);
    $value = str_replace(["\r", "\n"], " ", $value);
    return trim($value);
}

function clean_multiline(string $value): string
{
    return trim(strip_tags($value));
}

// ────────────────────────────────────────────────────────────
// VALIDACIÓN
// ────────────────────────────────────────────────────────────
$empresa  = clean_line($data["empresa"]  ?? "");
$contacto = clean_line($data["contacto"] ?? "");
$email    = clean_line($data["email"]    ?? "");
$telefono = clean_line($data["telefono"] ?? "");
$cantidad = clean_line($data["cantidad"] ?? "");
$mensaje  = clean_multiline($data["mensaje"] ?? "");

$errors = [];

if ($empresa === "")  $errors[] = "El nombre de la empresa es obligatorio.";
if ($contacto === "") $errors[] = "El nombre de contacto es obligatorio.";
if ($telefono === "") $errors[] = "El teléfono es obligatorio.";
if ($cantidad === "") $errors[] = "Seleccione una cantidad estimada.";
if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "El correo electrónico no es válido.";
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["success" => false, "message" => implode(" ", $errors)]);
    exit;
}

// ────────────────────────────────────────────────────────────
// ARMAR Y ENVIAR EL CORREO
// ────────────────────────────────────────────────────────────
$subject = "Nuevo pedido empresarial — {$empresa}";

$body  = "Se recibió una nueva solicitud de cotización desde " . SITE_NAME . ":\n\n";
$body .= "Empresa / Hotel:     {$empresa}\n";
$body .= "Persona de contacto: {$contacto}\n";
$body .= "Correo:              {$email}\n";
$body .= "Teléfono:            {$telefono}\n";
$body .= "Cantidad estimada:   {$cantidad}\n";
$body .= "Mensaje:\n{$mensaje}\n";

$headers   = [];
$headers[] = "From: " . SITE_NAME . " <" . FROM_EMAIL . ">";
$headers[] = "Reply-To: {$contacto} <{$email}>";
$headers[] = "Content-Type: text/plain; charset=UTF-8";
$headers[] = "X-Mailer: PHP/" . phpversion();

$encodedSubject = "=?UTF-8?B?" . base64_encode($subject) . "?=";

$sent = @mail(TO_EMAIL, $encodedSubject, $body, implode("\r\n", $headers));

/*
 * ── ALTERNATIVA RECOMENDADA PARA PRODUCCIÓN (PHPMailer + SMTP) ──
 * Si mail() no entrega de forma confiable en el hosting, reemplazar
 * el bloque de arriba por PHPMailer con SMTP autenticado. Ejemplo:
 *
 *   require 'vendor/autoload.php'; // instalado vía Composer
 *   use PHPMailer\PHPMailer\PHPMailer;
 *
 *   $mail = new PHPMailer(true);
 *   $mail->isSMTP();
 *   $mail->Host       = 'smtp.tudominio.com';
 *   $mail->SMTPAuth   = true;
 *   $mail->Username   = 'no-reply@purenapkinrd.com';
 *   $mail->Password   = 'CONTRASEÑA_SMTP';
 *   $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
 *   $mail->Port       = 587;
 *   $mail->setFrom(FROM_EMAIL, SITE_NAME);
 *   $mail->addAddress(TO_EMAIL);
 *   $mail->addReplyTo($email, $contacto);
 *   $mail->Subject = $subject;
 *   $mail->Body    = $body;
 *   $sent = $mail->send();
 */

if ($sent) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "No se pudo enviar el correo en este momento. Intente por WhatsApp.",
    ]);
}

