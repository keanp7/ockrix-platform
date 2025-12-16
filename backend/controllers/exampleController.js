/**
 * Example Controller File
 * 
 * Responsibility: Handles request/response logic and delegates business logic to services.
 * Controllers should be thin - they validate input, call services, and format responses.
 * 
 * Responsibilities:
 * - Extract data from request (params, query, body)
 * - Validate input (can use middleware for complex validation)
 * - Call service layer for business logic
 * - Format and send responses
 * - Handle errors (let errorHandler middleware catch them)
 * 
 * Example structure:
 * 
 * const exampleService = require('../services/exampleService');
 * 
 * exports.getExample = async (req, res, next) => {
 *   try {
 *     const data = await exampleService.getExampleData(req.params.id);
 *     res.status(200).json({ success: true, data });
 *   } catch (error) {
 *     next(error); // Pass to error handler
 *   }
 * };
 */

// This is an example file showing the structure
// Replace with your actual controller files
