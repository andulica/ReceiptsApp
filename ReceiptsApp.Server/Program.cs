var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactDev",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "https://localhost:5173") // Allow HTTP and HTTPS
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Add this if you're using cookies or credentials
        });
});


var app = builder.Build();

app.UseCors("AllowReactDev");

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
