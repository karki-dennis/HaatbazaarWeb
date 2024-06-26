﻿using HaatBazaar.Web.Models.Connections;
using Microsoft.AspNetCore.Mvc;

namespace HaatBazaar.Web.Controllers
{
    public class ConnectionController(IConfiguration configuration) : BaseController(configuration)
    {
        private const string Endpoint = "connect";
        public async Task<IActionResult> Index(int connectionId)
        {
            var connection = await GetByIdAsync<ConnectionResponseModel>($"{Endpoint}", connectionId);
            if(connection == null)
            {
                return RedirectToAction("Login", "Login");
            }
            return View(connection);
        }

        [HttpPost]
        public async Task<IActionResult> RequestToBuy(int connectionId)
        {
            var contractModel = new ContractRequestModel { ConnectionId = connectionId };
            var response = await PostAsync("contracts", contractModel);

            return RedirectToAction("Index", new { connectionId });
        }

        [HttpPost]
        public async Task<IActionResult> Approve(int connectionId)
        {
            var contractModel = new ContractRequestModel { ConnectionId = connectionId };
            await PutAsync("contracts", contractModel);
            return RedirectToAction("Index", new { connectionId});
        }
    }
}