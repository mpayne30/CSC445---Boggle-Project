import java.io.*;

public class TextFileProcessor {

    public static void main(String[] args) {
        // Provide the path to your input and output text files
        String inputFile = "words2.txt";
        String outputFile = "words3.txt";
        
        try (BufferedReader reader = new BufferedReader(new FileReader(inputFile));
             BufferedWriter writer = new BufferedWriter(new FileWriter(outputFile))) {
             
            StringBuilder result = new StringBuilder();
            String line;
            boolean firstLine = true;
            
            while ((line = reader.readLine()) != null) {
                if (!firstLine) {
                    result.append(", "); // Add comma and space separator
                } else {
                    firstLine = false;
                }
                
                // Escape double quotes if they exist in the line
                line = line.replace("\"", "\\\"");
                
                // Wrap the line content in double quotes
                result.append("\"").append(line).append("\"");
            }
            
            // Write the final result to the output file
            writer.write(result.toString());
            
            System.out.println("Output written to " + outputFile);
            
        } catch (IOException e) {
            System.err.println("Error processing file: " + e.getMessage());
        }
    }
}
