using Microsoft.ML.Data;

namespace ReceiptsApp.Server.MLModels
{
    public class LineData
    {
        [LoadColumn(0)]
        public string TextLinie { get; set; }

        [LoadColumn(1), ColumnName("Label")]
        public string LineLabel { get; set; }
    }
}
