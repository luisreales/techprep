using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;
using TechPrep.Core.Entities;

namespace TechPrep.Infrastructure.Data;

public class TechPrepDbContextFactory : IDesignTimeDbContextFactory<TechPrepDbContext>
{
    public TechPrepDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var config = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddJsonFile("appsettings.json", optional: true)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<TechPrepDbContext>();
        var connectionString = config.GetConnectionString("DefaultConnection") ?? "Data Source=techprep.db";
        optionsBuilder.UseSqlite(connectionString);

        return new TechPrepDbContext(optionsBuilder.Options);
    }
}
